"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import InputModal from "@/components/InputModal";

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
    plan: "day" | "month" | "year";
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
  const [joinRadioDraw, setJoinRadioDraw] = useState(false);
  const [modalType, setModalType] = useState<null | "login" | "password" | "plate">(null); 

useEffect(() => {
  const stored = localStorage.getItem("user");
  if (!stored) {
    router.push("/");
    return;
  }

  const parsed = JSON.parse(stored);
  const email = parsed?.email;

  if (!email) {
    router.push("/");
    return;
  }

  fetch("/api/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error("❌ /api/user error: " + text);
      }
      return res.json();
    })
    .then((data) => {
      if (data.error) {
        router.push("/");
      } else {
        setUser(data);
      setJoinRadioDraw(data.joinRadioDraw || false);

        // ✅ Після отримання user — отримати коментарі
        fetch("/api/comments/by-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data.id }),
        })
          .then((res) => res.json())
          .then((commentsData) => {
            if (!commentsData.error) {
              setComments(commentsData);
            }
          });
      }
    })
    .catch((err) => {
      console.error(err);
      router.push("/");
    });
}, [router]);

  const submitNewLogin = async (value: string) => {
    if (!user || value.length > 10) return alert(t.login_max_10);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, login: value }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data?.error || t.update_failed);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      setModalType(null);
    } catch {
      alert(t.network_error);
    }
  };

  const submitNewPlate = async (value: string) => {
    if (!user) return;
    const plateFormatted = value.toUpperCase();
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, plate: plateFormatted }),
      });
      const updated = await res.json();
      if (!res.ok) return alert(t.error);
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setModalType(null);
    } catch {
      alert(t.network_error);
    }
  };

    const submitNewPassword = async (value: { oldPassword: string, newPassword: string }) => {
    if (!value.oldPassword || !value.newPassword || !user) return;
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: user.login,
          oldPassword: value.oldPassword,
          newPassword: value.newPassword
        })
      });
      const result = await res.json();
      if (result.success) {
        const updated = { ...user, password: value.newPassword };
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
        alert(t.password_updated);
        setModalType(null);
      } else {
        alert(t.password_incorrect);
      }
    } catch {
      alert(t.network_error);
    }
  };


const handleDelete = async () => {
  if (!user) return;

  if (confirm(t.confirm_delete)) {
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (!res.ok) {
        alert(t.update_failed); // переклад
        return;
      }

      localStorage.removeItem("user");
      setUser(null);
      router.push("/");
      window.location.reload(); // повне оновлення

    } catch {
      alert(t.network_error);
    }
  }
};

const handleAddTrackedPlate = async () => {
  if (!user || !user.pro || !user.proUntil || new Date(user.proUntil) <= new Date()) return;

  const formatted = newPlate.toUpperCase().replace(/\s+/g, "");
  if (!formatted) return;

  try {
    const res = await fetch("/api/user/add-plate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, plate: formatted }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error === "plate_exists") return alert(t.plate_exists);
      if (data.error === "plate_limit") return alert(t.plate_limit);
      return alert(t.update_failed);
    }

    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    setNewPlate("");

  } catch {
    alert(t.network_error);
  }
};


const handleRemovePlate = async (plateToRemove: string) => {
  if (!user) return;

  try {
    const res = await fetch("/api/user/remove-plate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, plate: plateToRemove })
    });

    const data = await res.json();

    if (!res.ok) {
  const key = data.error as keyof typeof t;
  return alert(t[key] || "Error");
}

    // ✅ Оновлюємо user у localStorage і в state
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);

  } catch {
    alert(t.network_error);
  }
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

const handleDeleteComment = async (id: string) => {
  if (!confirm(t.confirm_delete)) return;

  try {
    const res = await fetch("/api/comments/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "❌ " + t.update_failed);
      return;
    }

    // 🔄 Оновлюємо список коментарів
    setComments((prev) => prev.filter((c) => c.id !== id));
  } catch {
    alert(t.network_error);
  }
};

const handleLogout = () => {
  localStorage.removeItem("user");
  setUser(null);
  router.push("/");
  window.location.reload();
};

const handleToggleDraw = async (checked: boolean) => {
  try {
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;
    if (!user?.email) return;

    const res = await fetch("/api/account/join-draw", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, join: checked }),
    });

    if (res.ok) {
      setJoinRadioDraw(checked);
      const updated = { ...user, joinRadioDraw: checked };
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("userUpdated"));
    }
  } catch (err) {
    console.error("❌ Failed to update join draw setting:", err);
  }
};


  return (
     <>
{user?.email === "gudz80@gmail.com" && (
  <button
    onClick={async () => {
      try {
        const res = await fetch("/api/user/pro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data?.error || "Помилка");
          return;
        }

        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
        alert("✅ Ви стали PRO (30 днів)");
      } catch {
        alert("❌ Помилка з’єднання");
      }
    }}
    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mt-4"
  >
    ✅ Стати PRO (30 днів)
  </button>
)}


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
      <Image
  key={idx}
  src={`/badges/${b}.svg`}
  alt={b}
  title={b}
  width={24}
  height={24}
  className="w-6 h-6"
/>
    ))}
  </div>
)}

            </div>

{user?.pro && (
  <div className="mt-6 flex items-center justify-between border rounded-xl p-4">
    <div>
      <p className="font-medium text-gray-800">{t.radio_draw_title}</p>
      <p className="text-sm text-gray-600">{t.radio_draw_desc}</p>
      <a href="/draw" className="mt-2 inline-block text-sm text-blue-700 underline hover:text-blue-900 transition"  
      >
        📜 {t.radio_draw_rules}
      </a>
    </div>
    <Switch
      checked={joinRadioDraw}
      onCheckedChange={handleToggleDraw}
    />
  </div>
)}


            <div className="text-sm text-gray-700">
  {t.main_plate}: <strong>{user.plate || t.not_set}</strong>{" "} 
  <button onClick={() => setModalType("plate")} className="underline text-blue-800">{t.change_plate}</button>
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
      className={`px-3 py-1 text-sm rounded ${selectedPlateFilter === null ? "bg-blue-800 text-white" : "bg-white text-blue-800"}`}
    >
      {t.all_plates}
    </button>
    {trackedPlates.map((plate, idx) => (
      <button
        key={idx}
        onClick={() => setSelectedPlateFilter(plate || null)}
        className={`px-3 py-1 text-sm rounded ${selectedPlateFilter === plate ? "bg-blue-800 text-white" : "bg-white text-blue-800"}`}
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
                 maxLength={7}
                  className="border px-2 py-1 rounded text-sm flex-grow"
                />
               <button
  onClick={handleAddTrackedPlate}
  className="bg-blue-800 text-white px-2 py-1 rounded hover:bg-blue-700 text-sm w-full sm:w-auto whitespace-nowrap"
>
 {t.add}
</button>
   
  {Array.isArray(user?.paymentHistory) && user.paymentHistory.length > 0 && (
  <div className="mt-8">
    <h3 className="text-lg font-semibold text-blue-900 mb-3">{t.payment_history}</h3>
    <ul className="text-sm space-y-2">
      {user.paymentHistory.map((entry, idx) => (
        <li key={idx} className="border p-3 rounded shadow-sm bg-white">
          ✅ {t.plan_label}: <strong>{t[`plan_${entry.plan}` as keyof typeof t]}</strong> •
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
              className={`px-3 py-1 text-sm rounded ${activeTab === "comments"
                ? "bg-blue-800 text-white"
                : "bg-white border border-blue-300 text-blue-800"
              }`}
            >
             {t.comments_account}
             </button>
            <button
              onClick={() => setActiveTab("replies")}
              className={`px-3 py-1 text-sm rounded ${activeTab === "replies"
                ? "bg-blue-800 text-white"
                : "bg-white border border-blue-300 text-blue-800"
              }`}
            >
              {t.replies}
            </button>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="flex gap-3 text-sm">
                <button onClick={() => setModalType("login")} className="underline text-blue-800">{t.change_login}</button>
                <button onClick={() => setModalType("password")} className="underline text-blue-800">{t.change_password}</button>
                <button onClick={handleDelete} className="underline text-red-600">{t.delete}</button>
                <button onClick={handleLogout} className="underline text-gray-600">{t.logout}</button>
              </div>
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
 <InputModal
  type={modalType}
  onClose={() => setModalType(null)}
  onSubmit={{
    login: submitNewLogin,
    password: submitNewPassword,
    plate: submitNewPlate,
  }}
/>
</main>
 </>
  );
}