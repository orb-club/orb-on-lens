export const metadata = {
  title: 'Lens File Upload',
  description: 'Upload files to Lens Chain storage via Grove',
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
