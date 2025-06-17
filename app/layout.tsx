import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LanguageProvider } from "../context/LanguageContext";

export const metadata = {
  title: "MyPlateCheck",
  description: "Оцінки водіїв за номерними знаками",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="UA">
      <head>
        {/* ✅ Додаємо скрипти для підтримки TikTok і Instagram вставок */}
        <script async src="https://www.tiktok.com/embed.js"></script>
        <script async src="https://www.instagram.com/embed.js"></script>
      </head>
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </LanguageProvider>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.tiktokEmbedLoad = function() {
        if (window.tiktok && window.tiktok.loadEmbeds) {
          window.tiktok.loadEmbeds();
        }
      };
    `,
  }}
></script>

      </body>
    </html>
  );
}
