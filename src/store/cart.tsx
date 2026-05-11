import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  original: number;
  initials: string;
  gradient: string;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  savings: number;
};

const KEY = "novamarket_cart_v1";
const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const savings = items.reduce((s, i) => s + (i.original - i.price) * i.qty, 0);
    return {
      items,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add: (p, qty = 1) =>
        setItems((prev) => {
          const ex = prev.find((i) => i.id === p.id);
          if (ex) return prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
          return [
            ...prev,
            {
              id: p.id,
              slug: p.slug,
              name: p.name,
              price: Number(p.discount_price),
              original: Number(p.original_price),
              initials: p.initials,
              gradient: p.gradient,
              qty,
            },
          ];
        }),
      remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      setQty: (id, qty) =>
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))),
      clear: () => setItems([]),
      count,
      subtotal,
      savings,
    };
  }, [items, isOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
};
