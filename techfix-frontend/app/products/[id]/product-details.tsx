"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    getProduct,
    updateProduct,
    deleteProduct,
    getInventoryByProductId,
    getSupplier,
    bulkUpdateInventory,
    createPurchase,
} from "@/lib/api"
import type { Product, Inventory, PurchaseRequest } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ShoppingCart, Package, DollarSign, Truck, Shield, Pencil, Trash2 } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { EditProductDialog } from "./edit-product-dialog"
import { DeleteProductDialog } from "./delete-product-dialog"
import { useAuth } from "@/contexts/auth.context"
import { toast } from "sonner"
import { User, UserRole } from "@/types/user"

interface ProductDetailsProps {
    id: number
}

export default function ProductDetails({ id }: ProductDetailsProps) {
    const router = useRouter()
    const { user } = useAuth()
    const [product, setProduct] = useState<Product | null>(null)
    const [inventory, setInventory] = useState<Inventory | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [quantity, setQuantity] = useState(1)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [supplier, setSupplier] = useState<User | null>(null)

    const isAdmin = user?.role === UserRole.admin // Check if user is admin

    useEffect(() => {
        fetchProduct()
    }, [])

    const fetchProduct = async () => {
        try {
            const data = await getProduct(id)
            setProduct(data)
            await fetchInventory(data.id) // Fetch inventory after product is loaded
            await fetchSupplier(parseInt(data.supplierId)) // Fetch supplier after product is loaded
        } catch (err) {
            setError("Failed to load product details")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchInventory = async (productId: number) => {
        try {
            const data = await getInventoryByProductId(productId)
            setInventory(data)
        } catch (err) {
            console.error("Failed to fetch inventory:", err)
        }
    }

    const fetchSupplier = async (supplierId: number) => {
        try {
            const data = await getSupplier(supplierId)
            setSupplier(data)
        } catch (err) {
            console.error("Failed to fetch supplier:", err)
        }
    }

    const handleUpdate = async (updatedProduct: Partial<Product>) => {
        if (!product) return

        setIsUpdating(true)
        try {
            await updateProduct(product.id, updatedProduct)
            await fetchProduct() // Refresh product data
            setIsEditOpen(false)
            toast("Success", {
                description: "Product updated successfully",
            })
        } catch (err) {
            toast("Error", {
                description: "Failed to update product",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!product) return

        setIsDeleting(true)
        try {
            await deleteProduct(product.id)
            toast("Success", {
                description: "Product deleted successfully",
            })
            router.push("/products") // Redirect to products list
        } catch (err) {
            toast("Error", {
                description: "Failed to delete product"
            })
            setIsDeleting(false)
        }
    }

    const handlePurchase = async () => {
        if (!product || !user) return

        try {
            // Create a purchase request
            const purchaseRequest: PurchaseRequest = {
                userId: user.id,
                purchaseItems: [
                    {
                        productId: product.id,
                        quantity: quantity,
                        price: product.price,
                    },
                ],
            }

            // Create the purchase
            await createPurchase(purchaseRequest)

            // Update inventory
            const inventoryUpdate = {
                productId: product.id,
                quantityToAdd: -quantity, // Subtract the quantity
            }
            await bulkUpdateInventory([inventoryUpdate])

            // Notify the user
            toast("Success", {
                description: "Purchase successful. Inventory updated.",
            })

            // Refresh data
            await fetchProduct()
        } catch (err) {
            toast("Error", {
                description: "Failed to complete purchase. Please try again.",
            })
        }
    }

    if (loading || user === null) {
        return <div>Loading...</div>
    }

    if (error || !product) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                <p className="text-gray-600">{error || "Product not found"}</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/products")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto">
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/products/${id}`}>{product.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="space-y-4">
                    <Card className="p-4">
                        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                            <img
                                src={`https://api.dicebear.com/9.x/icons/svg?seed=${encodeURIComponent(product.name)}`}
                                alt={product.name}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </Card>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                            <div className="flex items-center gap-2 mb-4">
                                <Badge variant="secondary">Product ID: {product.id}</Badge>
                                <Badge variant="outline">Supplier: {supplier?.companyName}</Badge>
                            </div>
                            <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                        </div>

                        {isAdmin && (
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => setIsEditOpen(true)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => setIsDeleteOpen(true)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Description</h2>
                        <p className="text-muted-foreground">{product.description}</p>
                    </div>

                    <Separator />

                    {/* Inventory Management */}
                    {isAdmin && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Inventory</h2>
                            <div className="flex items-center gap-4">
                                <p className="text-muted-foreground">Current Quantity: {inventory?.quantity || 0}</p>
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Quantity Selector and Purchase Button */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <label htmlFor="quantity" className="font-medium">
                                Quantity:
                            </label>
                            <select
                                id="quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="border rounded-md px-2 py-1"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button className="w-full" size="lg" onClick={handlePurchase}>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Purchase - ${(product.price * quantity).toFixed(2)}
                        </Button>
                    </div>

                    {/* Product Features */}
                    <Card className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                <span className="text-sm">Free Packaging</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <span className="text-sm">Money-back Guarantee</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-primary" />
                                <span className="text-sm">Free Shipping</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <span className="text-sm">Secure Payment</span>
                            </div>
                        </div>
                    </Card>

                    {/* Navigation Links to Purchase History and Inventory Changes */}
                    {isAdmin && (
                        <div className="space-y-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push(`/products/${id}/purchase-history`)}
                            >
                                View Purchase History
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push(`/products/${id}/inventory-changes`)}
                            >
                                View Inventory Changes
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Dialog */}
            <EditProductDialog
                product={product}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onUpdate={handleUpdate}
                isLoading={isUpdating}
            />

            {/* Delete Dialog */}
            <DeleteProductDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onDelete={handleDelete}
                isLoading={isDeleting}
                productName={product.name}
            />
        </div>
    )
}