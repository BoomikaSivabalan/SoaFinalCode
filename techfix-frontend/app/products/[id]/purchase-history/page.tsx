"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getPurchasesByUser } from "@/lib/api"
import type { Purchase } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth.context"

export default function PurchaseHistoryPage() {
    const { id } = useParams<{ id: string }>()
    const { user } = useAuth()
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPurchaseHistory()
    }, [])

    const fetchPurchaseHistory = async () => {
        try {
            const purchases = await getPurchasesByUser(user?.id || 0)
            const productPurchases = purchases.filter((purchase) =>
                purchase.purchaseItems.some((item) => item.productId === parseInt(id))
            )
            setPurchases(productPurchases)
        } catch (err) {
            console.error("Failed to fetch purchase history:", err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <Button variant="outline" className="mb-6" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Product
            </Button>

            <h1 className="text-2xl font-bold mb-6">Purchase History</h1>

            {purchases.length > 0 ? (
                <Card className="p-6">
                    {purchases.map((purchase) => (
                        <div key={purchase.id} className="border-b last:border-b-0 py-4">
                            <p className="font-medium">Purchase ID: {purchase.id}</p>
                            <p>Date: {new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                            <p>Total: ${purchase.totalAmount.toFixed(2)}</p>
                        </div>
                    ))}
                </Card>
            ) : (
                <p>No purchase history found for this product.</p>
            )}
        </div>
    )
}