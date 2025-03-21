"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getSuppliers } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Building2 } from "lucide-react"
import {User} from "@/types/user";

export default function SupplierList() {
    const [suppliers, setSuppliers] = useState<User[]>([])
    const [filteredSuppliers, setFilteredSuppliers] = useState<User[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const data = await getSuppliers()
                setSuppliers(data)
                setFilteredSuppliers(data)
            } catch (err) {
                setError("Failed to load suppliers")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchSuppliers()
    }, [])

    useEffect(() => {
        if (searchQuery) {
            const filtered = suppliers.filter(
                (supplier) =>
                    supplier.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    supplier.companyName?.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            setFilteredSuppliers(filtered)
        } else {
            setFilteredSuppliers(suppliers)
        }
    }, [searchQuery, suppliers])

    if (loading) {
        return <div>Loading suppliers...</div>
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                <p className="text-gray-600">{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search suppliers..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredSuppliers.length === 0 ? (
                <div className="text-center py-10">
                    <h3 className="text-lg font-medium">No suppliers found</h3>
                    <p className="text-muted-foreground">Try adjusting your search criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSuppliers.map((supplier) => (
                        <Link key={supplier.id} href={`/suppliers/${supplier.id}`}>
                            <Card className="hover:bg-muted/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        {supplier.companyName}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground line-clamp-2">
                                        {supplier.username || "No description available"}
                                    </p>
                                    <div className="mt-4 text-sm">
                                        <span className="font-medium">Contact:</span> {supplier.email}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

