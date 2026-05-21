import Link from "next/link";
export default function Navbar() {
  return (
    <nav className="h-14 border-b flex items-center px-6 gap-6">
      <Link href="/" className="font-bold text-lg tracking-tight">Extracta</Link>
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">Dashboard</Link>
    </nav>
  );
}
