import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Extracta</h1>
      <Link href="/dashboard" className="text-blue-600 hover:underline">
        Go to Dashboard →
      </Link>
    </main>
  );
}
