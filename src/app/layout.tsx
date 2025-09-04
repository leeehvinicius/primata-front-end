import "./globals.css";
import ToasterProvider from "@/components/ToasterProvider";
import DevModeIndicator from "@/components/DevModeIndicator";

export const metadata = { title: "Primata Estética" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className="bg-gray-50 text-gray-900" suppressHydrationWarning>
        {children}
        <ToasterProvider />
        <DevModeIndicator />
      </body>
    </html>
  )
}