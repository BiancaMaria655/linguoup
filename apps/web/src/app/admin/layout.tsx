import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LinguoUp — Painel Administrativo",
  description:
    "Painel de administração da plataforma de aprendizado de idiomas LinguoUp.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col">{children}</div>
  );
}

