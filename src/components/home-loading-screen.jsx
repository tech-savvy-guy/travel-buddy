import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomeLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <Card className="w-full max-w-5xl p-8 shadow-none border-none">
        <div className="flex flex-col items-center text-center gap-8">
          <Skeleton className="h-[275px] w-[275px] rounded-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-14 w-48" />
        </div>
        <Skeleton className="h-px w-full my-7" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </Card>
    </div>
  )
}