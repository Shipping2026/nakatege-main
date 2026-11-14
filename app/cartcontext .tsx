"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
};

export type CartItem = Product & { qty: number };
export type OrderStatus = "none" | "pending" | "waiting";

type CartCtx = {
  items: CartItem[];
  addItem: (p: Product, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  total: number;
  count: number;
  orderStatus: OrderStatus;
  orderTotal: number;
  placeOrder: () => void;
  declarePaid: (method: string) => void;
  paidWith: string | null;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "panier-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("none");
  const [orderTotal, setOrderTotal] = useState(0);
  const [paidWith, setPaidWith] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setItems(d.items ?? []);
        setOrderStatus(d.orderStatus ?? "none");
        setOrderTotal(d.orderTotal ?? 0);
        setPaidWith(d.paidWith ?? null);
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ items, orderStatus, orderTotal, paidWith })
      );
    } catch {}
  }, [items, orderStatus, orderTotal, paidWith, ready]);

  const addItem = (p: Product, qty = 1) =>
    setItems((prev) => {
      const found = prev.find((i) => i.id === p.id);
      return found
        ? prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i))
        : [...prev, { ...p, qty }];
    });

  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
    );

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  const placeOrder = () => {
    if (items.length === 0) return;
    setOrderTotal(total);
    setOrderStatus("pending");
    setPaidWith(null);
    setItems([]);
  };

  const declarePaid = (method: string) => {
    setPaidWith(method);
    setOrderStatus("waiting");
  };

  return (
    <Ctx.Provider
      value={{ items, addItem, setQty, removeItem, total, count, orderStatus, orderTotal, placeOrder, declarePaid, paidWith }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return c;
}