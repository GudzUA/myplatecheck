"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";
import { addToCart } from "../../utils/cart";

type Product = {
  id: string;
  nameKey: string;
  descKey: string;
  price: string;
  priceValue: number;
  img: string;
};



const products: Product[] = [
  {
    id: "shirt",
    nameKey: "product_shirt",
    descKey: "product_shirt_desc",
    price: "24.99 CAD",
    priceValue: 24.99,
    img: "/shop/shirt.png",
  },
  {
    id: "cap",
    nameKey: "product_cap",
    descKey: "product_cap_desc",
    price: "19.99 CAD",
    priceValue: 19.99,
    img: "/shop/cap.png",
  },
  {
    id: "sticker",
    nameKey: "product_sticker",
    descKey: "product_sticker_desc",
    price: "4.99 CAD",
    priceValue: 4.99,
    img: "/shop/sticker.png",
  },
  {
    id: "keychain",
    nameKey: "product_keychain",
    descKey: "product_keychain_desc",
    price: "7.99 CAD",
    priceValue: 7.99,
    img: "/shop/keychain.png",
  },
  {
    id: "mug",
    nameKey: "product_mug",
    descKey: "product_mug_desc",
    price: "14.99 CAD",
    priceValue: 14.99,
    img: "/shop/mug.png",
  },
  {
    id: "notebook",
    nameKey: "product_notebook",
    descKey: "product_notebook_desc",
    price: "9.99 CAD",
    priceValue: 9.99,
    img: "/shop/notebook.png",
  },
];

export default function ShopPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [added, setAdded] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  const handleAdd = (p: Product) => {
  addToCart({
    id: p.id,
    name: t[p.nameKey],
    price: p.priceValue,
    quantity: 1,
    image: p.img,
  });

  window.dispatchEvent(new Event("storage"));
  setAdded(p.id);
  setTimeout(() => setAdded(null), 1500);
};



  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">{t.shop_title}</h1>
      <p className="text-center text-gray-700 mb-8">{t.shop_subtitle}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 text-center text-xs h-full flex flex-col justify-between">
            <Image
              src={p.img}
              alt={t[p.nameKey]}
              width={100}
              height={100}
              className="mx-auto mb-2 rounded cursor-pointer hover:scale-105 transition"
              onClick={() => setFullscreenImage(p.img)}
            />
            <h2 className="text-sm font-bold text-blue-800 mb-1">{t[p.nameKey]}</h2>
            <p className="text-gray-600 text-xs mb-1 line-clamp-2">{t[p.descKey]}</p>
            <p className="text-sm font-semibold text-blue-900 mb-2">{p.price}</p>
            <button
              className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800 transition text-xs"
              onClick={() => handleAdd(p)}
            >
              {added === p.id ? "✔" : t.shop_buy}
            </button>
          </div>
        ))}
      </div>

      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setFullscreenImage(null)}
        >
<Image
  src={fullscreenImage}
  alt="fullscreen"
  width={800}
  height={800}
  className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg border-2 border-white object-contain"
/>
        </div>
      )}
    </main>
  );
}
