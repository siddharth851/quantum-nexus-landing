import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  { name: "Sarah Chen", role: "Product Designer", text: "NovaMarket is unreal. I got Midjourney + Figma + Notion AI for less than the price of one. Instant delivery, premium experience.", rating: 5, color: "from-primary to-accent" },
  { name: "Marcus Reid", role: "Indie Developer", text: "Honestly the cleanest checkout I've ever used. Got my GitHub Copilot key in 4 seconds. Support replied in WhatsApp instantly.", rating: 5, color: "from-secondary to-primary" },
  { name: "Aisha Kapoor", role: "Marketing Lead", text: "We outfitted the whole team with AI tools at 70% off. The dashboard is gorgeous and the products all work flawlessly.", rating: 5, color: "from-accent to-secondary" },
  { name: "Diego Alvarez", role: "Filmmaker", text: "Got Runway, DaVinci and Adobe in one bundle. The flash sale section is dangerous — I spent way more than planned.", rating: 5, color: "from-primary to-secondary" },
  { name: "Priya Nair", role: "Course Creator", text: "Coursera Plus + MasterClass + Skillshare for the price of a coffee. This site looks like the future of e-commerce.", rating: 5, color: "from-accent to-primary" },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % reviews.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Testimonials</p>
          <h2 className="mt-2 text-4xl font-bold md:text-5xl">
            Loved by <span className="text-gradient">creators worldwide</span>
          </h2>
        </div>

        <div className="relative mx-auto mt-12 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl glass-strong p-8 md:p-10"
            >
              <Quote className="absolute right-6 top-6 h-16 w-16 text-primary/20" />
              <div className="flex items-center gap-1">
                {Array.from({ length: reviews[i].rating }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="mt-4 text-xl font-medium leading-relaxed text-white/90 md:text-2xl">
                "{reviews[i].text}"
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${reviews[i].color} text-sm font-bold`}>
                  {reviews[i].name.split(" ").map((w) => w[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold">{reviews[i].name}</p>
                  <p className="text-xs text-white/60">{reviews[i].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex justify-center gap-2">
            {reviews.map((_, k) => (
              <button
                key={k}
                onClick={() => setI(k)}
                aria-label={`Show review ${k + 1}`}
                className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-gradient-to-r from-primary to-accent" : "w-2 bg-white/20"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
