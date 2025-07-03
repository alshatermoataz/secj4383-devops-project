import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ChakraProvider } from "@chakra-ui/react";
import { CartProvider } from "@/contexts/CartContext";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShopLux - Premium E-Commerce",
  description:
    "Discover amazing products at unbeatable prices. Your premium shopping destination.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChakraProvider>
          <CartProvider>
            <Navigation />
            {children}
          </CartProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
