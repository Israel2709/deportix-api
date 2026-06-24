import type { ReactNode } from 'react';

export const metadata = {
  title: 'Deportix API',
  description: 'Public sports data API powered by Firestore.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          background: '#0b1120',
          color: '#e2e8f0',
        }}
      >
        {children}
      </body>
    </html>
  );
}
