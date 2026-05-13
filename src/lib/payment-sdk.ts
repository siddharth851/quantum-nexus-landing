// Client-side SDK loaders for payment gateways

const loaded = new Map<string, Promise<void>>();

export function loadScript(src: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const cached = loaded.get(src);
  if (cached) return cached;
  const p = new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
  loaded.set(src, p);
  return p;
}

export const loadRazorpay = () => loadScript("https://checkout.razorpay.com/v1/checkout.js");

export const loadCashfree = (mode: "sandbox" | "live" = "sandbox") =>
  loadScript(
    mode === "live"
      ? "https://sdk.cashfree.com/js/v3/cashfree.js"
      : "https://sdk.cashfree.com/js/v3/cashfree.js",
  );

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
    Cashfree?: (opts: { mode: "sandbox" | "production" }) => {
      checkout: (opts: { paymentSessionId: string; redirectTarget?: "_self" | "_blank" | "_modal" }) => Promise<{ error?: { message: string }; redirect?: boolean; paymentDetails?: unknown }>;
    };
  }
}
