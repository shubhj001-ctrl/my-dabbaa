import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "My Dabbaa — everyday tiffins, closer to home",
    template: "%s | My Dabbaa",
  },
  description:
    "Discover independent tiffin kitchens and everyday meals in Chandigarh.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
