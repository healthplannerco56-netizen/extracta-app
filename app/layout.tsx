import './globals.css';

export const metadata = {
  title: 'Extracta — AI Data Extraction',
  description: 'AI Data Extraction for Meta-Analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
