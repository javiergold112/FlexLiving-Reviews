import '../styles/globals.css';
import React from 'react';

export const metadata = { title: 'FlexLiving Reviews' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
