import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./components/AuthContext";

export const metadata: Metadata = {
  title: "SCE Permit Manager",
  description: "Southern Cities Enterprises - Permit Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
