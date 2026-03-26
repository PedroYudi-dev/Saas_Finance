import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Fintra — Controle Financeiro Pessoal",
  description: "Gerencie suas finanças com clareza. Acompanhe renda, gastos e contas a pagar em um dashboard moderno.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
