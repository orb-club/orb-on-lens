export const metadata = {
  title: 'Lens Accounts Available',
  description: 'Query Lens accounts available by address',
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
