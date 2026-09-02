import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card } from "@/components/ui/Card"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { EmptyState } from "@/components/ui/EmptyState"
import { AssetCard } from "./AssetCard"

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
          <AssetCard key={asset.id} asset={asset} />
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
