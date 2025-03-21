import { Suspense } from "react"
import SupplierDetails from "./supplier-details"
import type { Metadata } from "next"
import SupplierLoading from "./loading"

interface Props {
    params: {
        id: string
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Supplier/${params.id}`)
        const supplier = await response.json()

        return {
            title: `${supplier.name} - Suppliers - TechFix`,
            description: supplier.description || "Supplier details",
        }
    } catch (error) {
        return {
            title: "Supplier - TechFix",
            description: "Supplier details",
        }
    }
}

export default function SupplierPage({ params }: Props) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<SupplierLoading />}>
                <SupplierDetails id={Number.parseInt(params.id)} />
            </Suspense>
        </div>
    )
}

