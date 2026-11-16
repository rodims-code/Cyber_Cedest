import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Playwrite_US_Modern } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { readEffectsCookie, DEFAULT_EFFECTS } from "@/src/lib/display-preferences";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playwrite = Playwrite_US_Modern({
  weight: ["100", "200", "300", "400"],
  variable: "--font-playwrite",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cyber Cedest - Kinshasa | Bureautique, Wi-Fi MikroTik, Énergie Solaire & Formation",
  description:
    "Cyber Cedest à Kinshasa (RDC) : secrétariat & bureautique, distribution internet Wi-Fi par antenne MikroTik, énergie solaire autonome et formations informatiques.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const effects = readEffectsCookie((name) => cookieStore.get(name)) ?? DEFAULT_EFFECTS;

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      data-effects={effects}
      className={`${inter.variable} ${playwrite.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
