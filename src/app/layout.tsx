import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import CustomToastContainer from "./components/ToastContainer";

const poppins_init = Poppins({
  style: ["normal"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--poppins",
});

export const metadata: Metadata = {
  title: "alpha Sync",
  description: "alpha Sync Peptide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="images/favicon/favicon-96x96.png"
          sizes="96x96"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="images/favicon/favicon.svg"
        />
        <link rel="shortcut icon" href="images/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="images/favicon/apple-touch-icon.png"
        />
        <link rel="manifest" href="images/favicon/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${poppins_init.variable}  antialiased`}>
        {children}
        <CustomToastContainer />
      </body>
    </html>
  );
}
