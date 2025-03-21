"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getInventoryChanges, ChangeReason } from "@/lib/api"
import type { InventoryChange } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function InventoryChangesPage() {
    const { id } = useParams<{ id: string }>()
    const [changes, setChanges] = useState<InventoryChange[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchInventoryChanges()
    }, [])

    const fetchInventoryChanges = async () => {
        try {
            const changes = await getInventoryChanges(parseInt(id))
            setChanges(changes)
        } catch (err) {
            console.error("Failed to fetch inventory changes:", err)
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

            <h1 className="text-2xl font-bold mb-6">Inventory Changes</h1>

            {changes.length > 0 ? (
                <Card className="p-6">
                    {changes.map((change) => (
                        <div key={change.id} className="border-b last:border-b-0 py-4">
                            <p className="font-medium">Change ID: {change.id}</p>
                            <p>Date: {new Date(change.changeDate).toLocaleDateString()}</p>
                            <p>Quantity Change: {change.quantityChange}</p>
                            <p>Reason: {ChangeReason[change.reason]}</p>
                        </div>
                    ))}
                </Card>
            ) : (
                <p>No inventory changes found for this product.</p>
            )}
        </div>
    )
}