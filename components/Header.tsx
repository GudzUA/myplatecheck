"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { useEffect } from "react";
import LoginRegisterModal from "./LoginRegisterModal";
import Image from "next/image";
import { useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [plate, setPlate] = useState("");
  const { lang, setLang } = useLanguage();
  const t = translations[lang];
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<{ login: string; pro?: boolean } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProvincesMobile, setShowProvincesMobile] = useState(false);
  const [showProvinces, setShowProvinces] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);


  // 1. Користувач і mounted
useEffect(() => {
  const loadUser = () => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  };

  loadUser();

  const handleStorage = (e: StorageEvent) => {
    if (e.key === "user") loadUser();
  };

  const handleCustomUpdate = () => {
    loadUser();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener("userUpdated", handleCustomUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("userUpdated", handleCustomUpdate);
  };
}, []);

useEffect(() => {
  const status = localStorage.getItem("moderationStatus");
  if (status === "approved") {
    setBanner("✅ Ваш коментар опубліковано");
  } else if (status === "rejected") {
    setBanner("❌ Ваш коментар було відхилено");
  }

  if (status) {
    setTimeout(() => {
      setBanner(null);
      localStorage.removeItem("moderationStatus");
    }, 4000);
  }
}, []);


  // 2. Кошик
useEffect(() => {
  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
      setCartCount(count);
    } catch {}
  };

  updateCartCount();
  window.addEventListener("storage", updateCartCount);
  return () => window.removeEventListener("storage", updateCartCount);
}, []);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const input = plate.trim().toUpperCase().replace(/\s+/g, "");
    if (!input) return;



    const stored = localStorage.getItem("comments");
    if (!stored) return;

    type Comment = { plate: string; province: string };

    const comments: Comment[] = JSON.parse(stored);
    const match = comments.find((c) => c.plate === input);


    if (match) {
      router.push(`/plate/${match.province}/${input}`);
    } else {
      alert(t.not_found);
    }

    setPlate("");
  };

const timeoutRef = useRef<NodeJS.Timeout | null>(null);

const pathname = usePathname();

useEffect(() => {
  // Якщо сторінка змінилась — закриваємо модал
  setShowLogin(false);
}, [pathname]);

const handleMouseEnter = () => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  setShowProvinces(true);
};

const handleMouseLeave = () => {
  timeoutRef.current = setTimeout(() => {
    setShowProvinces(false);
  }, 300); // 300 мс затримки — можеш збільшити до 500
};

  return (
    <>
      <nav className="bg-[url('/img/header-bg.png')] bg-cover bg-center text-white shadow-md px-4 py-2">
        <div className="max-w-7xl mx-auto">
          {/* 🖥 Desktop */}
          <div className="hidden md:flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/img/logo.png" alt="Logo" width={100} height={40} />
            </Link>
            <ul className="flex flex-row space-x-4 text-[17px] font-semibold tracking-wide uppercase">
              <li><Link href="/add" className="hover:text-blue-300 transition">{t.comments}</Link></li>
              <li><Link href="/rankings" className="hover:text-blue-300 transition">{t.rating}</Link></li>
              <li><Link href="/shop" className="hover:text-blue-300 transition">{t.shop_title}</Link></li>
           <div
  className="relative"
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>
  <span className="hover:text-blue-300 cursor-pointer uppercase font-semibold">
    {t.provinces}
  </span>

  {showProvinces && (
    <ul className="absolute left-0 mt-2 w-56 bg-white text-black border rounded shadow z-50">
      {[
        "Ontario", "Quebec", "Manitoba", "Alberta", "British Columbia",
        "Nova Scotia", "Saskatchewan", "New Brunswick", "Prince Edward Island",
        "Newfoundland and Labrador", "Yukon", "Northwest territories", "Nunavut", "USA",
      ].map((prov) => (
        <li key={prov}>
          <Link
            href={`/province/${prov.toLowerCase().replace(/\s+/g, "-")}`}
            className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition"
          >
            {prov}
          </Link>
        </li>
      ))}
    </ul>
  )}
</div>

            </ul>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t.search_placeholder}
                value={plate.toUpperCase()}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                className="w-[120px] px-2 py-1 rounded text-sm text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                maxLength={7}
              />
              <button type="submit" className="bg-white text-blue-800 font-semibold px-3 py-1 rounded hover:bg-gray-100 text-sm transition">
                {t.search}
              </button>
            </form>
            <div className="flex items-center gap-2">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as "UA" | "EN" | "FR")}
                className="text-sm text-black px-2 py-1 border border-gray-300 rounded"
              >
                <option value="EN">EN</option>
                <option value="FR">FR</option>
                <option value="UA">UA</option>
              </select>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/account" className="underline uppercase">{user.login}</Link>
                  {user.pro && <span className="bg-yellow-400 text-white px-2 py-0.5 rounded text-xs uppercase">⭐ PRO</span>}
                  <button onClick={() => {
                    localStorage.removeItem("user");
                    localStorage.removeItem("cart");
                    setUser(null);
                    window.location.reload();
                  }} className="underline uppercase">{t.logout}</button>
</div>
  ) : (
                <button onClick={() => setShowLogin(true)} className="underline uppercase">{t.login}</button>
              )}

                 <button onClick={() => router.push("/cart")} className="relative">
  <Image src="/img/cart-button.png" alt="Cart" width={30} height={30} />
  {cartCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
      {cartCount}
    </span>
  )}
</button>

            </div>
          </div>

          {/* 📱 Mobile */}
          <div className="md:hidden flex flex-col gap-2">
            {/* Line 1: Logo + Search */}
            <div className="flex items-center justify-between gap-2">
              <Link href="/">
                <Image src="/img/logo.png" alt="Logo" width={70} height={70} />
              </Link>
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t.search_placeholder}
                  value={plate.toUpperCase()}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="w-[100px] px-2 py-1 rounded text-sm text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  maxLength={7}
                />
                <button type="submit" className="bg-white text-blue-800 font-semibold px-2 py-1 rounded hover:bg-gray-100 text-sm transition">
                  {t.search}
                </button>
              </form>
            </div>

            {/* Line 2: Login + PRO + Cart + Lang + Burger */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-lg">👤</span>
                {user?.login && (
  <Link href="/account" className="text-sm font-semibold uppercase underline hover:text-green-300 transition">
    {user.login}
  </Link>
)}
                {user?.pro && <span className="bg-yellow-400 text-white px-2 py-0.5 rounded text-xs">⭐ PRO</span>}
                {user ? (
                  <button onClick={() => {
                    localStorage.removeItem("user");
                    localStorage.removeItem("cart");
                    setUser(null);
                    window.location.reload();
                  }} className="text-sm underline ml-2 uppercase uppercase">{t.logout}</button>
                ) : (
                  <button onClick={() => setShowLogin(true)} className="text-sm underline ml-2 uppercase">{t.login}</button>
                )}

              </div>

              <div className="flex items-center gap-2">
               <button onClick={() => router.push("/cart")} className="relative">
  <Image src="/img/cart-button.png" alt="Cart" width={30} height={30} />
  {cartCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
      {cartCount}
    </span>
  )}
</button>

                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as "UA" | "EN" | "FR")}
                  className="text-sm text-black px-1 py-1 border border-gray-300 rounded"
                >
                  <option value="EN">EN</option>
                  <option value="FR">FR</option>
                  <option value="UA">UA</option>
                </select>
                <button onClick={() => setMenuOpen(!menuOpen)} className="text-3xl text-white px-2">☰</button>
              </div>
            </div>

{menuOpen && (
  <div className="bg-white border border-blue-200 rounded-xl shadow-sm w-full flex flex-col items-start p-4 space-y-3">
    {/* Закрити меню */}
    <button
      onClick={() => setMenuOpen(false)}
      className="self-end text-3xl font-bold text-blue-800"
      aria-label="Close menu"
    >
      &times;
    </button>

    {/* Навігація */}
    <Link href="/add" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-blue-800">{t.comments}</Link>
    <Link href="/rankings" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-blue-800">{t.rating}</Link>
    <Link href="/shop" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-blue-800">{t.shop_title}</Link>

    {/* Провінції */}
    <div>
      <button
        onClick={() => setShowProvincesMobile(!showProvincesMobile)}
        className="block text-lg font-bold text-blue-800 "
      >
        {t.provinces}
      </button>
      {showProvincesMobile && (
        <ul className="bg-gray-200 rounded-lg p-2 mt-1 space-y-1">
          {[
            "Ontario", "Quebec", "Manitoba", "Alberta", "British Columbia",
            "Nova Scotia", "Saskatchewan", "New Brunswick", "Prince Edward Island",
            "Newfoundland and Labrador", "Yukon", "Northwest territories", "Nunavut", "USA",
          ].map((prov) => (
            <li key={prov}>
              <Link
                href={`/province/${prov.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => {
                  setShowProvincesMobile(false);
                  setMenuOpen(false);
                }}
                className="block text-sm text-blue-800 hover:bg-blue-600 px-2 py-1 rounded"
              >
                {prov}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>

  </div>
)}
{banner && (
  <div className="bg-yellow-100 text-blue-900 px-4 py-2 rounded text-sm text-center">
    {banner}
  </div>
)}

          </div>
        </div>
      </nav>

      {showLogin && <LoginRegisterModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
