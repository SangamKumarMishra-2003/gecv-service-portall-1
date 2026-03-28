"use client";

import "./globals.css";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Dynamically import components for better performance
const Header = dynamic(() => import("../components/Header"), {
  loading: () => <div className="h-16 bg-white shadow-sm"></div>
});

const Footer = dynamic(() => import("../components/Footer"), {
  loading: () => <div className="h-16 bg-gray-800"></div>
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide header/footer on dashboard
  const hideLayout =
    pathname.startsWith("/student/dashboard",
    ) || pathname.startsWith("/hostel-incharge/dashboard") || pathname.startsWith("/academics/dashboard")|| pathname.startsWith("/faculty/dashboard")
    ;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-800" suppressHydrationWarning={true}>
        {!hideLayout && <Header />}

        <main className="min-h-screen">
          {children}
        </main>

        {!hideLayout && <Footer />}
      </body>
    </html>
  );
}
