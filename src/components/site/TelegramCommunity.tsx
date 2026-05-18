import { Send, Users, Bell, Sparkles } from "lucide-react";
import { TELEGRAM_HANDLE } from "@/lib/whatsapp";

export function TelegramCommunity() {
  return (
    <section className="relative px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-12">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-sky-300">
                <Send className="h-3.5 w-3.5" /> Telegram Community
              </div>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Join our <span className="text-gradient">Telegram</span> for updates & offers
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Get exclusive deals, new product drops, flash sales and product announcements directly in your pocket.
              </p>
              <ul className="mt-5 grid gap-2 text-sm text-white/70 sm:grid-cols-2">
                <li className="flex items-center gap-2"><Bell className="h-4 w-4 text-sky-400" /> Instant offers</li>
                <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-sky-400" /> Early product drops</li>
                <li className="flex items-center gap-2"><Users className="h-4 w-4 text-sky-400" /> 12k+ members</li>
                <li className="flex items-center gap-2"><Send className="h-4 w-4 text-sky-400" /> Announcements only</li>
              </ul>
              <p className="mt-3 text-[11px] text-white/40">
                Telegram is for community updates only. All purchases happen on WhatsApp.
              </p>
            </div>
            <a
              href={`https://t.me/${TELEGRAM_HANDLE}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 px-6 py-4 text-sm font-semibold shadow-[0_0_30px_rgba(14,165,233,0.4)] transition hover:scale-105"
            >
              <Send className="h-5 w-5" /> Join on Telegram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
