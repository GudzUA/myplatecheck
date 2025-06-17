"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";


type Comment = {
  id: string;
  comment: string;
  createdAt: string;
  parentId?: string;
  plate: string;
  author: string;
  userType: string;
};

type User = {
  email: string;
  login: string;
  plate: string;
  password: string;
  type: string;
  pro?: boolean;
  proUntil?: string;
  tariff?: string;
  trackedPlates?: string[];
  badges?: string[]; 
  paymentHistory?: {
    plan: string;
    amount: number;
    date: string;
  }[];
};


export default function AccountPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];

  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<"comments" | "replies">("comments");
  const [newPlate, setNewPlate] = useState("");
  const [selectedPlateFilter, setSelectedPlateFilter] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      router.push("/");
    }

    const storedComments = localStorage.getItem("comments");
    if (storedComments) {
      const all: Comment[] = JSON.parse(storedComments);
      setComments(all);
    }
  }, [router]);

const handleChangeLogin = () => {
  const newLogin = prompt(t.prompt_new_login);
  if (newLogin && user) {
    const updated = { ...user, login: newLogin };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);

    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
 const updatedUsers = allUsers.map((u: User) =>
      u.email === user.email ? { ...u, login: newLogin } : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  }
};


const handleChangePassword = () => {
  const oldPass = prompt(t.prompt_old_password);
  const newPass = prompt(t.prompt_new_password);

  const stored = localStorage.getItem("user");
  if (!stored) return;

  const parsed = JSON.parse(stored);

  if (parsed.password && parsed.password !== oldPass) {
    alert(t.password_incorrect);
    return;
  }

  parsed.password = newPass;
  localStorage.setItem("user", JSON.stringify(parsed));

  const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
  const updatedUsers = allUsers.map((u: User) => 
    u.login === parsed.login ? { ...u, password: newPass } : u
  );
  localStorage.setItem("users", JSON.stringify(updatedUsers));

  alert(t.password_updated);
};


const handleChangePlate = () => {
  const newPlate = prompt(t.prompt_new_plate);
  if (newPlate && user) {
    const plateFormatted = newPlate.toUpperCase();
    const updated = { ...user, plate: plateFormatted };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);

    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
const updatedUsers = allUsers.map((u: User) =>
      u.login === user.login ? { ...u, plate: plateFormatted } : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  }
};


  const handleLogout = () => {
  localStorage.removeItem("user");
  setUser(null);
  router.push("/");
  window.location.reload(); // ⬅️ Додаємо це
};

const handleDelete = () => {
  if (!user) return;

  if (confirm(t.confirm_delete)) {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
const updatedUsers = allUsers.filter((u: User) => u.login !== user.login);

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.removeItem("user");

    router.push("/");
    window.location.reload(); // ⬅️ щоб усе повністю оновилось
  }
};


const handleAddTrackedPlate = () => {
  if (
  !user?.pro ||
  (user.proUntil && new Date(user.proUntil) <= new Date()) ||
  !newPlate.trim()
) return;

  const formatted = newPlate.toUpperCase().replace(/\s+/g, "");
  const tracked = user.trackedPlates || [];

  if (tracked.includes(formatted)) return alert(t.plate_exists);
  if (tracked.length >= 4) return alert(t.plate_limit);

  const updated = { ...user, trackedPlates: [...tracked, formatted] };
  localStorage.setItem("user", JSON.stringify(updated));
  setUser(updated);
  setNewPlate("");

  // 🟡 Оновити users[]
  const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
const updatedUsers = allUsers.map((u: User) => 
    u.login === user.login ? { ...u, trackedPlates: [...tracked, formatted] } : u
  );
  localStorage.setItem("users", JSON.stringify(updatedUsers));
};


const handleRemovePlate = (plate: string) => {
  if (!user?.pro) return;

  const updatedList = user.trackedPlates?.filter(p => p !== plate) || [];
  const updated = { ...user, trackedPlates: updatedList };

  localStorage.setItem("user", JSON.stringify(updated));
  setUser(updated);

  const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
const updatedUsers = allUsers.map((u: User) => 
    u.login === user.login ? { ...u, trackedPlates: updatedList } : u
  );
  localStorage.setItem("users", JSON.stringify(updatedUsers));
};


  const trackedPlates = [user?.plate, ...(user?.trackedPlates || [])].filter(Boolean);

 const filtered = comments.filter(c => {
  const isCommentOrReply = activeTab === "comments" ? !c.parentId : c.parentId;
  const isOwn = c.author === user?.login;
  const isTracked = trackedPlates.includes(c.plate);

  const matchesPlate = selectedPlateFilter
    ? c.plate === selectedPlateFilter
    : true;

  if (user?.pro) {
    return (isOwn || isTracked) && isCommentOrReply && matchesPlate;
  } else {
    return isOwn && isCommentOrReply;
  }
});


  const stats = {
    total: comments.filter(c => trackedPlates.includes(c.plate)).length,
    comments: comments.filter(c => !c.parentId && trackedPlates.includes(c.plate)).length,
    replies: comments.filter(c => c.parentId && trackedPlates.includes(c.plate)).length,
  };

const handleDeleteComment = (id: string) => {
  if (!confirm(t.confirm_delete)) return;

  const stored = localStorage.getItem("comments");
  if (!stored) return;

  const all: Comment[] = JSON.parse(stored);
  const updated = all.filter(c => c.id !== id);

  localStorage.setItem("comments", JSON.stringify(updated));
  setComments(updated);
}; 

  return (
     <>
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white shadow-md border border-blue-200 rounded-xl p-6 space-y-6">
        <div className="text-xl font-bold text-blue-900">{t.title}</div>

        {user && (
          <>
           <div className="flex items-center flex-wrap gap-2 text-blue-900 font-semibold text-lg">
              👤 {user.login}

             {user?.pro && (!user.proUntil || new Date(user.proUntil) > new Date()) && (
  <span className="bg-yellow-400 text-white px-2 py-1 rounded text-xs ml-2">
    ⭐ PRO
  </span>
)}

{Array.isArray(user?.badges) && user.badges.length > 0 && (
  <div className="flex flex-wrap gap-1 mt-2">
    <span className="text-sm text-gray-600">{t.badges_label}:</span>
    {user.badges.map((b, idx) => (
      <img
        key={idx}
        src={`/badges/${b}.svg`}
        alt={b}
        title={b}
        className="w-6 h-6"
      />
    ))}
  </div>
)}

            </div>

            <div className="text-sm text-gray-700">
  {t.main_plate}: <strong>{user.plate || t.not_set}</strong>{" "}
  <button onClick={handleChangePlate} className="underline ml-1 text-blue-700"> {t.change}</button>
</div>

         {!user.pro && (
        <button
        onClick={() => router.push("/upgrade")}
        className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 font-semibold"
      >
        {t.upgrade}
      </button>
    )}
  </>
)}

        {user?.pro && (
  <div className="flex flex-wrap gap-2 mt-4">
    <button
      onClick={() => setSelectedPlateFilter(null)}
      className={`px-3 py-1 rounded border ${selectedPlateFilter === null ? "bg-blue-800 text-white" : "bg-white text-blue-800"}`}
    >
      {t.all_plates}
    </button>
    {trackedPlates.map((plate, idx) => (
      <button
        key={idx}
        onClick={() => setSelectedPlateFilter(plate || null)}
        className={`px-3 py-1 rounded border ${selectedPlateFilter === plate ? "bg-blue-800 text-white" : "bg-white text-blue-800"}`}
      >
        {plate}
      </button>
    ))}
  </div>
)}

        {user?.pro && (
          <>
            <div className="bg-blue-50 p-4 rounded border border-blue-300">
              <div className="text-sm text-blue-900 mb-2 font-semibold">{t.extra_plates}</div>
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mb-3">
                <input
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                 placeholder={t.placeholder_new_plate}
                  className="border p-2 rounded flex-grow"
                />
               <button
  onClick={handleAddTrackedPlate}
  className="bg-blue-800 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm w-full sm:w-auto whitespace-nowrap"
>
 {t.add}
</button>
   
  {Array.isArray(user?.paymentHistory) && user.paymentHistory.length > 0 && (
  <div className="mt-8">
    <h3 className="text-lg font-semibold text-blue-900 mb-3">{t.payment_history}</h3>
    <ul className="text-sm space-y-2">
      {user.paymentHistory.map((entry, idx) => (
        <li key={idx} className="border p-3 rounded shadow-sm bg-white">
          ✅ {t.plan_label}: <strong>{t[`plan_${entry.plan}`]}</strong> •
          💳 {t.amount}: <strong>{entry.amount.toFixed(2)} CAD</strong> •
          🕒 {new Date(entry.date).toLocaleString()}
        </li>
      ))}
    </ul>
  </div>
)}

         </div>
              <ul className="text-sm space-y-1">
                {(user.trackedPlates || []).map((p, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span>📌 {p}</span>
                    <button
                      onClick={() => handleRemovePlate(p)}
                      className="text-red-600 text-xs hover:underline"
                    >
                      ❌ {t.remove}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-gray-600">
  {t.total}: {stats.total} | {t.comments_account}: {stats.comments} | {t.replies}: {stats.replies}
</p>
            </div>
          </>
        )}

        <div className="flex justify-between mt-4 gap-2 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("comments")}
              className={`px-4 py-2 rounded ${activeTab === "comments"
                ? "bg-blue-800 text-white"
                : "bg-white border border-blue-300 text-blue-800"
              }`}
            >
             {t.comments_account}
             </button>
            <button
              onClick={() => setActiveTab("replies")}
              className={`px-4 py-2 rounded ${activeTab === "replies"
                ? "bg-blue-800 text-white"
                : "bg-white border border-blue-300 text-blue-800"
              }`}
            >
              {t.replies}
            </button>
          </div>
          <div className="flex gap-3 text-sm">
            <button onClick={handleChangeLogin} className="underline text-blue-800">{t.change_login}</button>
            <button onClick={handleChangePassword} className="underline text-blue-800">{t.change_password}</button>
            <button onClick={handleDelete} className="underline text-red-600">{t.delete}</button>
            <button onClick={handleLogout} className="underline text-gray-600">{t.logout}</button>
          </div>
        </div>

        
<div className="pt-4">
  {filtered.length === 0 ? (
    <p className="text-sm text-gray-500 italic">{t.no_records}</p>
  ) : (
     filtered.map((c) => (
  <div
    key={c.id}
    className="border border-gray-300 bg-gray-50 p-3 rounded shadow-sm mb-3 relative"
  >
    <div className="mb-1">
  <div className="text-sm font-semibold text-blue-900">
    📌 {c.plate} · {c.parentId ? t.reply : t.comment}
  </div>
  <div className="text-sm text-gray-700">
    {typeof window !== "undefined" ? new Date(c.createdAt).toLocaleString() : ""}
  </div>
</div>
    {/* 🗑️ Кнопка видалення, тільки для PRO і якщо автор співпадає */}
    {user?.pro && c.author === user.login && (
      <button
        onClick={() => handleDeleteComment(c.id)}
        className="absolute top-2 right-2 text-red-600 text-xs hover:underline"
      >
        ❌ {t.delete_account}
      </button>
    )}
  </div>
))

  )}
</div>
</div>
</main>
 </>
  );
}