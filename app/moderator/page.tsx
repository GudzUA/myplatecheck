'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import parse from "html-react-parser";
import { getEmbedHTML } from "../../utils/embed";

type MediaItem = {
  url: string;
  type: string;
};

type Comment = {
  id: string;
  plate: string;
  province: string;
  comment: string;
  createdAt: string;
  parentId?: string;
  media?: MediaItem[];
  videoUrl?: string;
  votes?: number;
  author?: string;
  userType?: 'guest' | 'registered' | 'pro';
};

export default function ModeratorPanel() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [search, setSearch] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('comments');
    if (stored) {
      const parsed: Comment[] = JSON.parse(stored);
      setComments(parsed);
    }
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Видалити цей коментар?")) return;
    const updated = comments.filter(c => c.id !== id && c.parentId !== id);
    localStorage.setItem("comments", JSON.stringify(updated));
    setComments(updated);
  };

  const filtered = comments.filter((c) => {
    const matchesPlate = c.plate.toLowerCase().includes(search.toLowerCase());
    const matchesProvince = provinceFilter ? c.province.toLowerCase().includes(provinceFilter.toLowerCase()) : true;
    const matchesUser = userFilter ? (c.author || '').toLowerCase().includes(userFilter.toLowerCase()) : true;
    return matchesPlate && matchesProvince && matchesUser;
  });

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Панель модератора</h1>

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

      <table className="w-full border-collapse bg-white shadow rounded text-sm">
        <thead className="bg-blue-100 text-left">
          <tr>
            <th className="p-3">Дата</th>
            <th className="p-3">Тип</th>
            <th className="p-3">Номер</th>
            <th className="p-3">Провінція</th>
            <th className="p-3">Коментар</th>
            <th className="p-3">Медіа</th>
            <th className="p-3">Відео</th>
            <th className="p-3">Голоси</th>
            <th className="p-3">Автор</th>
            <th className="p-3">Статус</th>
            <th className="p-3 text-right">Видалити</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id} className="border-t hover:bg-blue-50 align-top">
              <td className="p-2">{new Date(c.createdAt).toLocaleString()}</td>
              <td className="p-2">{c.parentId ? 'Відповідь' : 'Коментар'}</td>
              <td className="p-2">{c.plate}</td>
              <td className="p-2">{c.province}</td>
              <td className="p-2 max-w-xs break-words">{c.comment}</td>
              <td className="p-2">
                {Array.isArray(c.media) && c.media.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {c.media.map((m, i) =>
                      m.type.startsWith('video') ? (
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
                ) : '-'}
              </td>
              <td className="p-2">
                {c.videoUrl ? (
                  <div className="w-[120px] h-[68px] overflow-hidden rounded border border-gray-300 shadow-sm">
                    <div className="scale-[0.6] origin-top-left">
                      {parse(getEmbedHTML(c.videoUrl) || "")}
                    </div>
                  </div>
                ) : '-'}
              </td>
              <td className="p-2">{typeof c.votes === 'number' ? c.votes : 0}</td>
              <td className="p-2">{c.author || 'Анонім'}</td>
              <td className="p-2 capitalize">{c.userType || 'guest'}</td>
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
