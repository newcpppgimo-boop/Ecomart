import './globals.css';

export const metadata = {
  title: 'EcoMart',
  description: 'Give packaging a second life — reduce, reuse, recycle.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
