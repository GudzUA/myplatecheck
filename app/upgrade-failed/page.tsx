"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";
import { useState } from "react";
import ModalAlert from "../../components/ModalAlert";

export default function UpgradeFailedPage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);

  return (
    <>
      {showModal && (
        <ModalAlert
          show={true}
          title={t.title_info}
          message={t.pro_failed}
          onClose={() => {
            setShowModal(false);
            router.push("/upgrade");
          }}
        />
      )}
    </>
  );
}
