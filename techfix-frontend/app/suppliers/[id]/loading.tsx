import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SupplierDetailLoading() {
    return (
        <div className="max-w-4xl mx-auto">
            <Skeleton className="h-6 w-96 mb-6" />

            <Card>
                <CardHeader>
                    <Skeleton className="h-10 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-24 w-full" />
                    </div>

                    <div className="space-y-4">
                        <Skeleton className="h-6 w-48" />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Skeleton className="h-6" />
                            <Skeleton className="h-6" />
                            <Skeleton className="h-6 sm:col-span-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

