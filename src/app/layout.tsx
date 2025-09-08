import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Snake Game | Classic Arcade Game',
  description: 'Play the classic Snake game in your browser. Use arrow keys or WASD to control the snake, eat food to grow, and avoid collisions. Try to beat your high score!',
  keywords: 'snake game, arcade game, classic game, browser game, retro game',
  authors: [{ name: 'Snake Game App' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1f2937',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}