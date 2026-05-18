// WhatsApp helper: central number + message builders.
// Update WHATSAPP_NUMBER to your real support number (international format, no "+").

export const WHATSAPP_NUMBER = "10000000000";
export const TELEGRAM_HANDLE = "novamarket";
export const SUPPORT_HOURS = "Mon–Sun · 9 AM – 11 PM IST";
export const TYPICAL_REPLY = "Usually replies in 5 minutes";

export function waLink(message: string, number: string = WHATSAPP_NUMBER) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildProductMessage(p: {
  name: string;
  price?: number | string;
  id?: string;
  slug?: string;
}, user?: { email?: string | null; name?: string | null } | null) {
  const lines = [
    `Hello NovaMarket 👋`,
    ``,
    `I want to purchase: *${p.name}*`,
    p.price !== undefined ? `Price: $${p.price}` : "",
    p.id ? `Product ID: ${p.id}` : "",
    p.slug ? `Link: /product/${p.slug}` : "",
    ``,
    user?.name ? `Name: ${user.name}` : "",
    user?.email ? `Email: ${user.email}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

export function buildCartMessage(
  items: Array<{ name: string; qty: number; price: number; id: string }>,
  total: number,
  orderNumber: string,
  user?: { email?: string | null; name?: string | null } | null,
) {
  const lines = [
    `Hello NovaMarket 👋`,
    ``,
    `I'd like to place this order: *${orderNumber}*`,
    ``,
    `Items:`,
    ...items.map((i) => `• ${i.name} ×${i.qty} — $${(i.price * i.qty).toFixed(2)}`),
    ``,
    `Total: *$${total.toFixed(2)}*`,
    ``,
    user?.name ? `Name: ${user.name}` : "",
    user?.email ? `Email: ${user.email}` : "",
    ``,
    `Please share payment & activation details.`,
  ].filter(Boolean);
  return lines.join("\n");
}
