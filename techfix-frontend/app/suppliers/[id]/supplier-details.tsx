"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupplier } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Building2, Mail, Phone, MapPin } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {User} from "@/types/user";

interface SupplierDetailsProps {
    id: number
}

export default function SupplierDetails({ id }: SupplierDetailsProps) {
    const router = useRouter()
    const [supplier, setSupplier] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSupplier = async () => {
            try {
                const data = await getSupplier(id)
                setSupplier(data)
            } catch (err) {
                setError("Failed to load supplier details")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchSupplier()
    }, [id])

    if (loading) {
        return <div>Loading...</div>
    }

    if (error || !supplier) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                <p className="text-gray-600">{error || "Supplier not found"}</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/suppliers")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Suppliers
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/suppliers">Suppliers</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/suppliers/${id}`}>{supplier.id}</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-3xl">
                        <Building2 className="h-8 w-8" />
                        {supplier.username}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">About</h2>
                        <p className="text-muted-foreground">{supplier.companyName || "No description available"}</p>
                    </div>

                    <div className="grid gap-4">
                        <h2 className="text-xl font-semibold">Contact Information</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{supplier.username}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{supplier.email || "Not provided"}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

