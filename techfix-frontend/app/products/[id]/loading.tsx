import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ProductLoading() {
    return (
        <div className="max-w-7xl mx-auto">
            {/* Breadcrumb Loading */}
            <div className="mb-6">
                <Skeleton className="h-6 w-64" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Loading */}
                <Card className="p-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                </Card>

                {/* Product Info Loading */}
                <div className="space-y-6">
                    <div>
                        <Skeleton className="h-10 w-3/4 mb-2" />
                        <div className="flex gap-2 mb-4">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                        <Skeleton className="h-8 w-32" />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-24 w-full" />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-8 w-20" />
                        </div>
                        <Skeleton className="h-12 w-full" />
                    </div>

                    <Card className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

