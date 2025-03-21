"use client"

import { useEffect, useState } from "react"
import {getPurchases, getPurchasesByUser} from "@/lib/api"
import type { Purchase } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth.context"

export default function PurchaseHistoryPage() {
    const { user } = useAuth()
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPurchaseHistory()
    }, [])

    const fetchPurchaseHistory = async () => {
        try {
            const purchases = await getPurchases()
            setPurchases(purchases)
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
            <h1 className="text-2xl font-bold mb-6">Purchase History</h1>

            {purchases.length > 0 ? (
                <Card className="p-6">
                    {purchases.map((purchase) => (
                        <div key={purchase.id} className="border-b last:border-b-0 py-4">
                            <p className="font-medium">Purchase ID: {purchase.id}</p>
                            <p>Date: {new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                            <p>Total: ${purchase.totalAmount.toFixed(2)}</p>
                            <div className="mt-2">
                                <h3 className="font-semibold">Items:</h3>
                                {purchase.purchaseItems.map((item) => (
                                    <div key={item.productId} className="ml-4 mb-4">
                                        <p>Product ID: {item.productId}</p>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Price: ${item.price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </Card>
            ) : (
                <p>No purchase history found.</p>
            )}
        </div>
    )
}