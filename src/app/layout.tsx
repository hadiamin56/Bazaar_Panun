import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsappFloat } from "@/components/WhatsappFloat";
import { SiteProvider } from "@/components/SiteProvider";
import { getSettings } from "@/lib/settings";
import { getCategories } from "@/lib/products";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

// Settings and categories come from the database, so every page is rendered on request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { store } = await getSettings();
  return { title: store.seoTitle, description: store.seoDescription, icons: { icon: store.logo } };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteProvider value={{ settings, categories }}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsappFloat />
        </SiteProvider>
      </body>
    </html>
  );
}
