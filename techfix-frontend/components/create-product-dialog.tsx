"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { createProduct, getSuppliers } from "@/lib/api"

interface CreateProductDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateProductDialog({ open, onOpenChange }: CreateProductDialogProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [suppliers, setSuppliers] = useState<{ id: number; companyName: string }[]>([])
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        supplierId: "", // This will store the selected supplier ID
    })

    // Fetch suppliers when the dialog opens
    useEffect(() => {
        if (open) {
            fetchSuppliers()
        }
    }, [open])

    const fetchSuppliers = async () => {
        try {
            const data = await getSuppliers()
            setSuppliers(data.map(supplier => ({
                id: supplier.id,
                companyName: supplier.companyName,
            })))
        } catch (error) {
            toast("Error", {
                description: "Failed to fetch suppliers. Please try again.",
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await createProduct({
                name: formData.name,
                price: Number.parseFloat(formData.price),
                description: formData.description,
                supplierId: formData.supplierId,
            })

            toast("Success", {
                description: "Product created successfully",
            })

            // Reset form and close dialog
            setFormData({
                name: "",
                price: "",
                description: "",
                supplierId: "",
            })
            onOpenChange(false)

            // Refresh the page to show new product
            window.location.reload()
        } catch (error) {
            toast("Error", {
                description: "Failed to create product. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Product</DialogTitle>
                    <DialogDescription>Add a new product to your inventory. Fill in all the details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="Product name"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                                placeholder="0.00"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="Product description"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="supplierId">Supplier</Label>
                            <select
                                id="supplierId"
                                value={formData.supplierId}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        supplierId: e.target.value,
                                    }))
                                }
                                className="border rounded-md p-2"
                                required
                                disabled={isLoading}
                            >
                                <option value="">Select a supplier</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.companyName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Product"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}