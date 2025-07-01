"use client";

import { useEffect, useState } from "react";
import parse from "html-react-parser";
import { getEmbedHTML } from "@/utils/embed";
import Image from "next/image";

type Comment = {
  id: string;
  plate: string;
  province: string;
  comment: string;
  createdAt: string;
  parentId?: string;
  author?: string;
  userType?: string;
  media?: { url: string; type: string }[];
  videoUrl?: string;
  votes?: number;
};

export default function ModeratorPage() {
  const [comments, setComments] = useState<Comment[]>([]);
const [search, setSearch] = useState('');
const [provinceFilter, setProvinceFilter] = useState('');
const [userFilter, setUserFilter] = useState('');
const filtered = comments.filter((c) => {
  const matchesPlate = c.plate.toLowerCase().includes(search.toLowerCase());
  const matchesProvince = provinceFilter ? c.province.toLowerCase().includes(provinceFilter.toLowerCase()) : true;
  const matchesUser = userFilter ? (c.author || '').toLowerCase().includes(userFilter.toLowerCase()) : true;
  return matchesPlate && matchesProvince && matchesUser;
});

 useEffect(() => {
  const stored = localStorage.getItem("user");
  if (!stored) return;

  const parsed = JSON.parse(stored);
  const email = parsed.email;

  fetch("/api/moderation/all-comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.error) setComments(data);
    })
    .catch((err) => console.error("❌ API fetch error:", err));
}, []);


  const handleDelete = async (id: string) => {
    if (!confirm("Видалити цей коментар?")) return;
    await fetch("/api/moderation/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Панель модератора</h1>
<div className="flex flex-wrap gap-4 mb-6">
  <input
    type="text"
    placeholder="Пошук по номеру"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border p-2 rounded w-[200px]"
  />
  <input
    type="text"
    placeholder="Пошук по провінції"
    value={provinceFilter}
    onChange={(e) => setProvinceFilter(e.target.value)}
    className="border p-2 rounded w-[200px]"
  />
  <input
    type="text"
    placeholder="Пошук по користувачу"
    value={userFilter}
    onChange={(e) => setUserFilter(e.target.value)}
    className="border p-2 rounded w-[200px]"
  />
</div>

      <table className="w-full text-sm bg-white shadow border">
        <thead className="bg-blue-100 text-left">
          <tr>
            <th className="p-2">Дата</th>
            <th className="p-2">Тип</th>
            <th className="p-2">Номер</th>
            <th className="p-2">Провінція</th>
            <th className="p-2">Коментар</th>
            <th className="p-2">Медіа</th>
            <th className="p-2">Відео</th>
            <th className="p-2">Голоси</th>
            <th className="p-2">Автор</th>
            <th className="p-2">Статус</th>
            <th className="p-2 text-right">Дія</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id} className="border-t align-top">
              <td className="p-2">{new Date(c.createdAt).toLocaleString()}</td>
              <td className="p-2">{c.parentId ? "Відповідь" : "Коментар"}</td>
              <td className="p-2">{c.plate}</td>
              <td className="p-2">{c.province}</td>
              <td className="p-2 max-w-sm break-words">{c.comment}</td>
              <td className="p-2">
                {c.media?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {c.media.map((m, i) =>
                      m.type.includes("video") ? (
                        <video key={i} src={m.url} className="w-20 h-12" controls />
                      ) : (
                        <Image
                          key={i}
                          src={m.url}
                          alt="media"
                          width={60}
                          height={40}
                          className="rounded object-cover"
                        />
                      )
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-2 max-w-[160px]">
  {c.videoUrl ? (
     <div className="w-[140px] h-[80px] overflow-hidden border border-gray-300 rounded shadow-sm">
      {parse(getEmbedHTML(c.videoUrl) || "")}
    </div>
  ) : (
    "-"
  )}
</td>

              <td className="p-2">{c.votes ?? 0}</td>
              <td className="p-2">{c.author || "Анонім"}</td>
              <td className="p-2 capitalize">{c.userType || "guest"}</td>
              <td className="p-2 text-right">
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Видалити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

