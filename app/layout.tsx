import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CampusConnect | Karnataka Student Network & Engagement Platform",
  description:
    "An integrated student community and campus engagement platform for verified college students across Karnataka, India. Peer tutoring, campus marketplace, hackathons, and project teams.",
  keywords: [
    "CampusConnect",
    "Karnataka Colleges",
    "VTU Students",
    "RVCE",
    "BMSCE",
    "VVCE Mysuru",
    "PES University",
    "NITK Surathkal",
    "Engineering notes",
    "Peer tutoring",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
