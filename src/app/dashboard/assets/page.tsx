import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function AssetsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const myAssets = await prisma.asset.findMany({
    where: { assignedToId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Assets</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myAssets.map(asset => (
          <div key={asset.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl">
                {asset.type === 'LAPTOP' ? '💻' : asset.type === 'MONITOR' ? '🖥' : '📱'}
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                asset.status === "ASSIGNED" ? "bg-green-100 text-green-800" :
                asset.status === "REPAIR" ? "bg-red-100 text-red-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {asset.status}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-1">{asset.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Type: {asset.type}</p>
            
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <button className="text-red-600 hover:text-red-800 text-sm font-medium">Report Issue</button>
            </div>
          </div>
        ))}

        {myAssets.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            You do not have any company assets assigned to you yet.
          </div>
        )}
      </div>
    </div>
  )
}
