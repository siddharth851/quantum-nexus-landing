import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER, TYPICAL_REPLY, waLink } from "@/lib/whatsapp";

export function WhatsAppFab() {
  const href = waLink("Hello NovaMarket 👋 I need help with a product.", WHATSAPP_NUMBER);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-2">
      <div className="hidden sm:flex flex-col items-end">
        <div className="mb-1 rounded-2xl glass-strong px-3 py-2 text-xs shadow-lg animate-float">
          <p className="font-semibold text-white">Need help? Chat with us</p>
          <p className="text-white/60">{TYPICAL_REPLY}</p>
        </div>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.6)] transition hover:scale-110"
      >
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-400/40" />
        <MessageCircle className="h-6 w-6 text-white" />
        <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 ring-2 ring-background">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        </span>
      </a>
    </div>
  );
}
