"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { bulkUpdateInventory, createPurchase, Product } from "@/lib/api"
import { useAuth } from "@/contexts/auth.context"
import { toast } from "sonner"

export default function CartPage() {
    const { user } = useAuth()
    const [cart, setCart] = useState<Product[]>([])

    useEffect(() => {
        // Get the cart from localStorage
        const cartData = JSON.parse(localStorage.getItem("cart") || "[]")
        setCart(cartData)
    }, [])

    const handlePurchase = async () => {
        if (!user) {
            toast.error("You must be logged in to make a purchase.")
            return
        }

        if (cart.length === 0) {
            toast.error("Your cart is empty.")
            return
        }

        try {
            // Create a purchase request
            const purchaseRequest = {
                userId: user.id,
                purchaseItems: cart.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
            }

            // Create the purchase
            await createPurchase(purchaseRequest)

            // Update inventory for each item in the cart
            const inventoryUpdates = cart.map((item) => ({
                productId: item.id,
                quantityToAdd: -item.quantity, // Subtract the quantity
            }))
            await bulkUpdateInventory(inventoryUpdates)

            // Clear the cart
            localStorage.removeItem("cart")
            setCart([])

            // Notify the user
            toast.success("Purchase successful! Your cart has been cleared.")
        } catch (err) {
            toast.error("Failed to complete purchase. Please try again.")
            console.error(err)
        }
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="space-y-4">
                    {cart.map((item) => (
                        <Card key={item.id}>
                            <CardHeader>
                                <CardTitle>{item.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Quantity: {item.quantity}</p>
                                <p>Price: ${item.price.toFixed(2)}</p>
                                <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
                            </CardContent>
                        </Card>
                    ))}
                    <div className="flex justify-between items-center">
                        <p className="text-xl font-bold">
                            Total: $
                            {cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                        </p>
                        <Button onClick={handlePurchase}>Purchase</Button>
                    </div>
                </div>
            )}
        </div>
    )
}