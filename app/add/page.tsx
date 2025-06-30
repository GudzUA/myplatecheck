"use client";

import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModalAlert from "../../components/ModalAlert";
import LoginRegisterModal from "../../components/LoginRegisterModal";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";
import Image from "next/image";


type MediaItem = {
  name: string;
  type: string;
  url: string;
};

type Comment = {
  id: string;
  plate: string;
  province: string;
  comment: string;
  createdAt: string;
  media?: MediaItem[];
  videoUrl?: string;
  author: string;
  parentId?: string;
  userType: "guest" | "registered" | "pro";
  email?: string;    
  badges?: string[];     
  pending?: boolean;   
  userId?: string;
};

type AppUser = {
  email: string;
  login: string;
  password: string;
  pro?: boolean;
  proUntil?: string;
  usedInitialLimit?: boolean;
  badges?: string[];
};

export default function AddCommentPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];

  const [plate, setPlate] = useState("");
  const [province, setProvince] = useState("");
  const [comment, setComment] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [alertMode, setAlertMode] = useState<"login" | "upgrade" | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [userType, setUserType] = useState<"guest" | "free" | "pro">("guest");


async function uploadBase64Image(base64: string, type: string): Promise<string | null> {
  try {
    const name = crypto.randomUUID() + "." + type.split("/")[1];

    const res = await fetch("/api/upload-media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ base64, type, name }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Upload failed:", data.error);
      return null;
    }

    console.log("✅ Firebase uploaded URL:", data.url);
    return data.url;
  } catch (err) {
    console.error("❌ Error uploading:", err);
    return null;
  }
}

useEffect(() => {
  const user = localStorage.getItem("user");

  if (user) {
    try {
      const parsed = JSON.parse(user);
      const type = parsed?.type || (parsed?.pro ? "pro" : "free");
      setUserType(type);
    } catch {
    }
  } else {
    setUserType("guest"); // 👈 додаємо це
  }

  setMounted(true); // 👈 тепер виконується завжди
}, []);


const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;

  const files = Array.from(e.target.files);

  if (mediaFiles.length + files.length > 3) {
    alert("Можна додати максимум 3 фото");
    return;
  }

  for (const file of files) {
    try {
      // 🔽 Стискаємо кожне зображення
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.25, // ~250KB
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      // ➕ Додаємо в mediaFiles
      setMediaFiles((prev) => [...prev, compressedFile]);

      // 🖼️ Додаємо превʼю (з вже стиснутого файлу)
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error("Помилка стискання:", err);
    }
  }
};

const handleRemoveImage = (index: number) => {
  setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
};

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("submit attempt");

    const storedUser = localStorage.getItem("user");
    const allCommentsRaw = localStorage.getItem("comments");
    const allComments: Comment[] = allCommentsRaw ? JSON.parse(allCommentsRaw) : [];

    const user = storedUser ? JSON.parse(storedUser) : null;
    const isPro = user?.pro === true;

    const newCommentCount = user
      ? allComments.filter((c) => !c.parentId && user.login === c.author).length
      : allComments.filter((c) => !c.parentId && c.author === "Гість").length;

    if (!storedUser && newCommentCount >= 100) {
      setModalMessage(t.login_required_to_comment);
      setAlertMode("login");
      return;
    }

    if (storedUser && !isPro && newCommentCount >= 100) {
      setModalMessage(t.comment_limit_pro);
      setAlertMode("upgrade");
      return;
    }

    if (!plate.trim() || !province || !comment.trim()) {
      setModalMessage(t.fill_all_fields);
      return;
    }

    const normalizedPlate = plate.toUpperCase().replace(/\s+/g, "");
    const newId = Date.now().toString();

const uploadedMedia: MediaItem[] = await Promise.all(
  mediaFiles.map(async (file) => {
    const base64 = await fileToBase64(file);
    const uploadedUrl = await uploadBase64Image(base64, file.type);

    return {
      name: file.name,
      type: file.type,
      url: uploadedUrl || "", // якщо не завантажилось — порожнє
    };
  })
);

    const expandedVideoUrl = await expandTikTokUrl(videoUrl.trim());
    const cleanUrl = expandedVideoUrl?.split("?")[0]; 
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

if (currentUser) {
  const allComments = JSON.parse(localStorage.getItem("comments") || "[]");
const userComments = allComments.filter(
  (c: Comment) => c.author === currentUser.login || c.author === currentUser.email
);

  const wasPro = currentUser.proUntil && new Date(currentUser.proUntil) < new Date();
  const isPro = currentUser.pro === true;

  if (!isPro && !wasPro && userComments.length >= 3) {
    alert("Ви використали всі безплатні коментарі. Оновіть до PRO.");
    return;
  }

  if (wasPro && !currentUser.usedInitialLimit && userComments.length >= 3) {
    alert("Ваш PRO закінчився. Ви вже використали безплатні коментарі.");
    return;
  }

  // Якщо закінчився PRO, ставимо прапорець
  if (wasPro && !currentUser.usedInitialLimit) {
    currentUser.usedInitialLimit = true;
    localStorage.setItem("user", JSON.stringify(currentUser));

    const users = JSON.parse(localStorage.getItem("users") || "[]");
const updatedUsers = users.map((u: AppUser) =>
  u.email === currentUser.email ? { ...u, usedInitialLimit: true } : u
);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  }
}

  const newComment: Comment = {
  id: newId,
  plate: normalizedPlate,
  province: province.toLowerCase(),
  author: currentUser?.login || currentUser?.email || "Гість",
  comment,
  createdAt: new Date().toISOString(),
  media: uploadedMedia,
  videoUrl: cleanUrl || undefined,
  userType: currentUser?.pro
    ? "pro"
    : currentUser?.login
    ? "registered"
    : "guest",
  email: currentUser?.email || undefined,
  badges: Array.isArray(currentUser?.badges)
    ? currentUser.badges
    : currentUser?.pro
    ? ["pro"]
    : currentUser?.login
    ? ["registered"]
    : ["guest"],
  pending: true,
  userId: currentUser?.id,
};

await fetch("/api/comments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newComment),
});


    setModalMessage(t.comment_saved);
    router.push("/");
  };

   const expandTikTokUrl = async (url: string): Promise<string> => {
  if (!url.includes("vm.tiktok.com")) return url;

  try {
    const res = await fetch("/api/expand-tiktok", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shortUrl: url }),
    });

    const data = await res.json();
    return data.fullUrl || url;
  } catch {
    return url;
  }
};

  if (!mounted) return null; // ⬅️ оце встав

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">{t.add_comment}</h1>

      {mounted && (
      <form onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl space-y-6"
      >
        <div>
          <label className="block font-medium text-gray-700 mb-1">{t.plate_label}</label>
          <input
            type="text"
            value={plate}
           onChange={(e) => {
            const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
             if (raw.length <= 7) setPlate(raw);
             }}
            placeholder={t.placeholder_example}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={7}
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">{t.province_label}</label>
<select
  value={province}
  onChange={(e) => setProvince(e.target.value)}
  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  required
>
  <option value="">{t.province_placeholder}</option>
  <option value="ontario">Ontario</option>
  <option value="quebec">Quebec</option>
  <option value="manitoba">Manitoba</option>
  <option value="alberta">Alberta</option>
  <option value="british_columbia">British Columbia</option>
  <option value="saskatchewan">Saskatchewan</option>
  <option value="nova_scotia">Nova Scotia</option>
  <option value="new_brunswick">New Brunswick</option>
  <option value="prince_edward_island">Prince Edward Island</option>
  <option value="newfoundland_and_labrador">Newfoundland and Labrador</option>
  <option value="yukon">Yukon</option>
  <option value="northwest_territories">Northwest Territories</option>
  <option value="nunavut">Nunavut</option>
  <option value="usa">USA</option>
</select>

        </div>

        <div>
          <label className="block font-medium text-gray-700">{t.comment_label}</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            placeholder={t.comment_placeholder}
            required
          />
        </div>

<div>
 <label className="block font-medium text-gray-700 flex items-center gap-1">
  {t.video_link}
  <span className="relative group cursor-pointer text-blue-600">
    <span className="font-bold border border-blue-500 w-5 h-5 flex items-center justify-center rounded-full text-xs">?</span>
    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                     max-w-[90vw] sm:w-60 bg-white border border-gray-300
                     text-gray-700 text-xs p-2 rounded shadow-md
                     opacity-0 group-hover:opacity-100 transition z-20 text-center">
      {t.tooltip_video}
    </span>
  </span>
</label>

{/* Відео URL */}
<input
  type="url"
  value={videoUrl}
  onChange={async (e) => {
    const rawUrl = e.target.value.trim();
    const expanded = await expandTikTokUrl(rawUrl);
    setVideoUrl(expanded);
  }}
  className="w-full mt-1 p-2 border border-gray-300"
/>
</div>

<div className="mt-2">
  <label className="block font-medium text-gray-700 flex items-center gap-1">
    {t.add_media}
  <span className="relative group cursor-pointer text-blue-600 ml-2">
  <span className="font-bold border border-blue-500 w-5 h-5 flex items-center justify-center rounded-full text-xs">?</span>
    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                     max-w-[90vw] sm:w-60 bg-white border border-gray-300
                     text-gray-700 text-xs p-2 rounded shadow-md
                     opacity-0 group-hover:opacity-100 transition z-20 text-center">
        {t.tooltip_photo}
      </span>
    </span>
  </label>
  <div className="max-w-full overflow-hidden">
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={handleMediaChange}
      className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100"
    />
  </div>
</div>
{previewUrls.length > 0 && (
  <div className="flex flex-wrap gap-4 mt-4">
    {previewUrls.map((url, i) => (
      <div key={i} className="relative">
        <Image
  src={url}
  alt={`Preview ${i + 1}`}
  width={96}
  height={96}
  className="object-cover rounded border"
/>
        <button
          type="button"
          onClick={() => handleRemoveImage(i)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-md"
        >
          ×
        </button>
      </div>
    ))}
  </div>
)}

       <p className="text-xs text-gray-600 mb-2">
  {t.rules_notice}{" "}
  <Link href="/rules" className="underline hover:text-blue-700">
    {t.rules_link}
  </Link>
</p>

        {modalMessage && (
          <ModalAlert
            show={true}
            title={t.alert_title}
            message={modalMessage}
            mode={alertMode ?? undefined}
            onLogin={() => {
              setModalMessage(null);
              setShowLogin(true);
            }}
            onUpgrade={() => {
              setModalMessage(null);
              router.push("/upgrade");
            }}
            onClose={() => {
              setModalMessage(null);
              setAlertMode(null);
            }}
          />
        )}

      {showLogin && <LoginRegisterModal onClose={() => setShowLogin(false)} />}
       <p className="text-xs text-gray-500">User type: {userType}</p>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t.save_comment}
        </button>
      </form>
      )}
    </main>
  );
}
