import type { Metadata } from "next";
import "./globals.css";

import { Roboto } from "next/font/google";
import { QueryProvider } from "@/providers/query-client-provider";
import { AppProvider } from "@/providers/app-provider";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Saiban",
  description: "An application for managing medicine record tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body className="font-sans antialiased">
        <NextTopLoader
          color="oklch(0.205 0 0)"
          showSpinner={false}
          height={4}
          crawlSpeed={200}
          speed={200}
          zIndex={9999}
          shadow="0 0 10px oklch(0.205 0 0),0 0 5px oklch(0.205 0 0)"
        />
        <AppProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </AppProvider>
      </body>
    </html>
  );
}
