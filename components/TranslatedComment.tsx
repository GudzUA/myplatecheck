"use client";

import { useTranslatedComment } from "../utils/useTranslatedComment";

interface Props {
  id: string;
  text: string;
}

export default function TranslatedComment({ id, text }: Props) {
  const { translated } = useTranslatedComment({ id, text });

  return <>{translated}</>;
}
