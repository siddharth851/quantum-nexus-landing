import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "crypto";
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

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        items: z.array(CartItemSchema).min(1).max(50),
        couponCode: z.string().optional(),
        provider: z.enum(["razorpay", "cashfree"]),
        contactName: z.string().min(1).max(120),
        contactEmail: z.string().email(),
        country: z.string().min(2).max(80).optional(),
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
        payment_method: data.provider,
        payment_status: "pending",
        coupon_code: appliedCode,
        contact_email: data.contactEmail,
        contact_name: data.contactName,
        billing_country: data.country ?? null,
        items: data.items,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Provider intent
    if (data.provider === "razorpay") {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret) {
        return {
          order,
          provider: "razorpay" as const,
          configured: false,
          message: "Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        };
      }
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: orderNumber,
          notes: { order_id: order.id, user_id: userId },
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        await supabase.from("orders").update({ status: "failed", payment_status: "failed" }).eq("id", order.id);
        throw new Error(body?.error?.description ?? "Razorpay order creation failed");
      }
      await supabase.from("orders").update({ gateway_order_id: body.id }).eq("id", order.id);
      await supabase.from("payments").insert({
        order_id: order.id,
        user_id: userId,
        provider: "razorpay",
        provider_order_id: body.id,
        amount: total,
        currency: "USD",
        status: "created",
        raw: body,
      });
      return { order, provider: "razorpay" as const, configured: true, gatewayOrderId: body.id, keyId };
    }

    // Cashfree
    const appId = process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;
    const mode = process.env.CASHFREE_MODE ?? "sandbox";
    if (!appId || !secret) {
      return {
        order,
        provider: "cashfree" as const,
        configured: false,
        message: "Cashfree keys not configured. Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY.",
      };
    }
    const base = mode === "live" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
    const res = await fetch(`${base}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secret,
      },
      body: JSON.stringify({
        order_id: orderNumber,
        order_amount: total,
        order_currency: "INR",
        customer_details: {
          customer_id: userId,
          customer_email: data.contactEmail,
          customer_name: data.contactName,
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: `${process.env.SITE_URL ?? ""}/checkout/success?order_id=${order.id}`,
        },
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      await supabase.from("orders").update({ status: "failed", payment_status: "failed" }).eq("id", order.id);
      throw new Error(body?.message ?? "Cashfree session creation failed");
    }
    await supabase.from("orders").update({ gateway_order_id: body.order_id ?? orderNumber }).eq("id", order.id);
    await supabase.from("payments").insert({
      order_id: order.id,
      user_id: userId,
      provider: "cashfree",
      provider_order_id: body.order_id ?? orderNumber,
      amount: total,
      currency: "USD",
      status: "created",
      raw: body,
    });
    return {
      order,
      provider: "cashfree" as const,
      configured: true,
      paymentSessionId: body.payment_session_id,
      mode,
    };
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        orderId: z.string().uuid(),
        razorpay_order_id: z.string(),
        razorpay_payment_id: z.string(),
        razorpay_signature: z.string(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay not configured");

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");
    const valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(data.razorpay_signature));
    if (!valid) {
      await supabase.from("orders").update({ status: "failed", payment_status: "failed" }).eq("id", data.orderId);
      throw new Error("Invalid payment signature");
    }

    const { data: order } = await supabase.from("orders").update({
      status: "paid",
      payment_status: "paid",
      transaction_id: data.razorpay_payment_id,
      gateway_payment_id: data.razorpay_payment_id,
      gateway_signature: data.razorpay_signature,
    }).eq("id", data.orderId).select().single();

    await supabase.from("payments").update({
      status: "paid",
      provider_payment_id: data.razorpay_payment_id,
    }).eq("order_id", data.orderId);

    if (order?.items && Array.isArray(order.items)) {
      const rows = (order.items as Array<{ id: string }>).map((it) => ({
        user_id: userId,
        product_id: it.id,
        status: "active",
      }));
      if (rows.length) await supabase.from("purchased_products").insert(rows);
    }
    return { ok: true, order };
  });

export const verifyCashfreePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ orderId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const appId = process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;
    const mode = process.env.CASHFREE_MODE ?? "sandbox";
    if (!appId || !secret) throw new Error("Cashfree not configured");

    const { data: order } = await supabase.from("orders").select("*").eq("id", data.orderId).single();
    if (!order) throw new Error("Order not found");

    const base = mode === "live" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
    const res = await fetch(`${base}/orders/${order.gateway_order_id}`, {
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secret,
      },
    });
    const body = await res.json();
    const paid = body?.order_status === "PAID";

    await supabase.from("orders").update({
      status: paid ? "paid" : "failed",
      payment_status: paid ? "paid" : "failed",
      transaction_id: body?.cf_order_id ? String(body.cf_order_id) : null,
    }).eq("id", data.orderId);
    await supabase.from("payments").update({ status: paid ? "paid" : "failed", raw: body }).eq("order_id", data.orderId);

    if (paid && Array.isArray(order.items)) {
      const rows = (order.items as Array<{ id: string }>).map((it) => ({
        user_id: userId,
        product_id: it.id,
        status: "active",
      }));
      if (rows.length) await supabase.from("purchased_products").insert(rows);
    }
    return { ok: paid, status: body?.order_status };
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
