"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getCart, removeFromCart, clearCart } from "../../utils/cart";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";

export default function CartPage() {
  const { lang } = useLanguage();
  const t = translations[lang];

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

const [cart, setCart] = useState<CartItem[]>([]);


  useEffect(() => {
    const stored = getCart();
    setCart(stored);
  }, []);

  const handleRemove = (id: string) => {
  removeFromCart(id);
  setCart(getCart());
  window.dispatchEvent(new Event("storage")); // 🔁 повідомляємо Header
};

const handleClear = () => {
  clearCart();
  setCart([]);
  window.dispatchEvent(new Event("storage")); // 🔁 повідомляємо Header
};


  const total = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">{t.shop_title}</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-center">{t.shop_alert}</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item: CartItem) => (
            <div key={item.id} className="flex items-center justify-between bg-white border p-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <Image src={item.image} alt={item.name} width={60} height={60} className="rounded" />
                <div>
                  <h2 className="font-semibold text-blue-800">{item.name}</h2>
                  <p className="text-sm text-gray-600">{item.quantity} × {item.price.toFixed(2)} CAD</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="text-sm text-red-500 hover:underline"
              >
                {t.remove || "Delete"}
              </button>
            </div>
          ))}

          <div className="text-right text-lg font-semibold mt-4">
            {t.total || "Total"}: {total.toFixed(2)} CAD
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={handleClear}
              className="text-sm text-gray-500 hover:underline"
            >
              {t.clear || "Clear cart"}
            </button>
            <button
              onClick={() => alert("Оплата поки не активна")}
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
            >
              {t.shop_buy}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
