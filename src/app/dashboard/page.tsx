import { prisma } from "@/lib/db";
import NavigationHeader from "@/components/navigation-header";
import Link from "next/link";

export default async function Dashboard() {
  const circles = await prisma.circle.findMany({
    include: {
      owner: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavigationHeader />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {circles.map((circle) => (
            <Link key={circle.id} href={`/circles/${circle.id}`}>
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                <h3 className="text-lg font-semibold text-white mb-2">{circle.name}</h3>
                <p className="text-slate-300 mb-4">{circle.description}</p>
                <div className="text-sm text-slate-400">
                  Target: {circle.targetAmount} BTC
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
