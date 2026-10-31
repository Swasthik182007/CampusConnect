import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

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
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
