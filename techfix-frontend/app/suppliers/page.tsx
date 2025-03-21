import { Suspense } from "react"
import type { Metadata } from "next"
import SupplierLoading from "@/app/suppliers/loading";
import SupplierList from "@/app/suppliers/supplier-list";
import AuthGuard from "@/components/authGuard";

export const metadata: Metadata = {
    title: "Suppliers - TechFix",
    description: "View and manage suppliers",
}

export default function SuppliersPage() {
    return (
        <AuthGuard>
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Suppliers</h1>
            <Suspense fallback={<SupplierLoading />}>
                <SupplierList />
            </Suspense>
        </div>
        </AuthGuard>
    )
}

