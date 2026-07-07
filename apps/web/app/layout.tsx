import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SplashScreenWrapper } from "./SplashScreenWrapper";

export const metadata: Metadata = {
  title: "LinguoUp — Aprenda idiomas em minutos por dia",
  description:
    "Plataforma de aprendizado de idiomas com microlições, gamificação e formação de hábitos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col">
        <Providers>
          <SplashScreenWrapper>{children}</SplashScreenWrapper>
        </Providers>
      </body>
    </html>
  );
}
