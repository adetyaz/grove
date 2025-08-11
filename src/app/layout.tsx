import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import DynamicWagmiProvider from "@/providers/DynamicWagmiProvider";
import DynamicErrorBoundary from "@/components/dynamic-error-boundary";
// import PerformanceMonitor from "@/components/performance-monitor";
import { ToastContainer } from "react-toastify";

// Disable Prisma debug logs globally
if (typeof globalThis !== "undefined") {
  (globalThis as any).DEBUG = "";
}

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Grove",
  description: "Growing wealth together",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌳</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <PerformanceMonitor /> */}
        <DynamicErrorBoundary>
          <DynamicWagmiProvider>{children}</DynamicWagmiProvider>
        </DynamicErrorBoundary>
        <ToastContainer
          position='top-right'
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='light'
          className='mt-16'
        />
      </body>
    </html>
  );
}
