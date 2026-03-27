export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 px-4 py-12">
      {/* 背景の装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-yellow-200 rounded-full opacity-20 blur-3xl" />
      </div>
      <div className="relative w-full flex justify-center">{children}</div>
    </div>
  );
}
