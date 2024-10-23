import "./globals.css";
import { Roboto } from "next/font/google";
import ReduxProvider from "./reduxProvider";
import { Metadata } from "next";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FaceIt feed",
  description: "A feed of posts from FaceIt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.className}>
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
