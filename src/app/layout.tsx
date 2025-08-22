import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = { title: "Primata Estética" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="bg-neutral-900 text-neutral-100">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}