import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { EmptyState } from "@/components/ui/EmptyState"

export default async function AssetsPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const myAssets = await prisma.asset.findMany({
    where: { assignedToId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8 font-sans">
      <PageHeader
        category="Equipment"
        title="My Assigned Assets"
        description="Company hardware, devices, and computing peripherals assigned to your account."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {myAssets.map((asset) => (
          <Card key={asset.id} hoverEffect className="flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600">
                  {asset.type === "LAPTOP" ? "💻" : asset.type === "MONITOR" ? "🖥️" : "📱"}
                </div>
                <StatusBadge status={asset.status} size="sm" />
              </div>

              <h3 className="font-bold text-base text-slate-900 mb-1">{asset.name}</h3>
              <p className="text-xs text-slate-500 font-medium">Category: {asset.type}</p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">ID: #{asset.id.slice(-6).toUpperCase()}</span>
              <button
                type="button"
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
              >
                Report Issue
              </button>
            </div>
          </Card>
        ))}

        {myAssets.length === 0 && (
          <div className="col-span-full">
            <Card>
              <EmptyState
                icon="💻"
                title="No Company Assets Assigned"
                description="You currently do not have any company hardware or peripheral assets assigned to your profile."
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
