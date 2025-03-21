"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AuthGuard from "@/components/authGuard"
import { useAuth } from "@/contexts/auth.context"
import { useEffect, useState } from "react"
import { UserRole } from "@/types/user"

export default function HomePage() {
    const { user, loading } = useAuth()
    const [isLoading, setIsLoading] = useState(true)

    // Wait for user data to load
    useEffect(() => {
        if (!loading) {
            setIsLoading(false)
        }
    }, [loading])

    // If user is null, handle it appropriately (maybe show a loading state)
    if (isLoading || user === null) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        )
    }

    // Define the pages
    const pages = [
        { name: "Products", href: "/products" },
        { name: "Quotations", href: "/quotations" },
        { name: "Suppliers", href: "/suppliers" },
        { name: "Create RFQ", href: "/quotations/create-rfq" },
        { name: "Purchase History", href: "products/purchase-history" },
        { name: "Inventory Changes", href: "products/inventory-changes" },
    ]

    // Filter out Purchase History and Inventory Changes for supplier users
    const filteredPages = pages.filter(page => {
        if (user && user.role === UserRole.supplier) {
            return page.name !== "Purchase History" && page.name !== "Inventory Changes"
        }
        return true
    })

    return (
        <AuthGuard>
            <div className="container mx-auto p-8">
                <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredPages.map((page) => (
                        <Card key={page.name}>
                            <CardHeader>
                                <CardTitle>{page.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Link href={page.href}>
                                    <Button className="w-full">Go to {page.name}</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AuthGuard>
    )
}