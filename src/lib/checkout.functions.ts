import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CartItemSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  original: z.number().nonnegative(),
  initials: z.string(),
  gradient: z.string(),
  qty: z.number().int().min(1).max(99),
});

function computeDiscount(
  subtotal: number,
  c: { discount_type: string; discount_value: number; min_order_amount: number; max_discount: number | null },
) {
  if (subtotal < Number(c.min_order_amount)) return 0;
  let d = c.discount_type === "percent"
    ? (subtotal * Number(c.discount_value)) / 100
    : Number(c.discount_value);
  if (c.max_discount != null) d = Math.min(d, Number(c.max_discount));
  return Math.min(d, subtotal);
}

function newOrderNumber() {
  return "NM-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export const validateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ code: z.string().min(1).max(40), subtotal: z.number().nonnegative() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: c, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", data.code.toUpperCase())
      .eq("active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!c) return { ok: false as const, message: "Invalid coupon code" };
    if (c.expires_at && new Date(c.expires_at) < new Date())
      return { ok: false as const, message: "Coupon expired" };
    if (data.subtotal < Number(c.min_order_amount))
      return { ok: false as const, message: `Minimum order $${c.min_order_amount}` };
    const discount = computeDiscount(data.subtotal, c);
    return {
      ok: true as const,
      code: c.code,
      description: c.description,
      discount: Number(discount.toFixed(2)),
    };
  });

/**
 * Creates a "pending" WhatsApp order. Payment + activation are confirmed
 * manually by admin after the customer completes purchase on WhatsApp.
 */
export const createWhatsappOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        items: z.array(CartItemSchema).min(1).max(50),
        couponCode: z.string().optional(),
        contactName: z.string().min(1).max(120),
        contactEmail: z.string().email(),
        country: z.string().min(2).max(80).optional(),
        notes: z.string().max(500).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const subtotal = Number(
      data.items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2),
    );

    let discount = 0;
    let appliedCode: string | null = null;
    if (data.couponCode) {
      const { data: c } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", data.couponCode.toUpperCase())
        .eq("active", true)
        .maybeSingle();
      if (c) {
        discount = computeDiscount(subtotal, c);
        appliedCode = c.code;
      }
    }
    const tax = Number(((subtotal - discount) * 0.05).toFixed(2));
    const total = Number((subtotal - discount + tax).toFixed(2));

    const orderNumber = newOrderNumber();
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_number: orderNumber,
        subtotal,
        discount,
        tax,
        total,
        currency: "USD",
        status: "pending",
        payment_method: "whatsapp",
        payment_status: "pending",
        coupon_code: appliedCode,
        contact_email: data.contactEmail,
        contact_name: data.contactName,
        billing_country: data.country ?? null,
        items: data.items,
        notes: data.notes ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { order };
  });

export const getOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ orderId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .single();
    if (error) throw new Error(error.message);
    return order;
  });
