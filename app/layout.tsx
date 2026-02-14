import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

import { Roboto } from "next/font/google";
import { QueryProvider } from "@/providers/query-client-provider";
import { AppProvider } from "@/providers/app-provider";
import NextTopLoader from "nextjs-toploader";
import { ToastContainer } from "react-toastify";

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
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </QueryProvider>
        </AppProvider>
      </body>
    </html>
  );
}
