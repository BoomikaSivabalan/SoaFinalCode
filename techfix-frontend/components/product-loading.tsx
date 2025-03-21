import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
    // Create an array of 8 items to represent loading products
    const loadingItems = Array.from({ length: 8 }, (_, i) => i)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Skeleton className="h-10 w-full sm:w-96" />
                <Skeleton className="h-10 w-full sm:w-[180px]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loadingItems.map((item) => (
                    <div key={item} className="border rounded-lg p-4 space-y-3">
                        <Skeleton className="h-[200px] w-full rounded-md" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-9 w-28" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

