import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/10000000000"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.6)] transition hover:scale-110 animate-float"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-400/40" />
      <MessageCircle className="h-6 w-6 text-white" />
    </a>
  );
}
