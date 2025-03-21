"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getProducts, Product } from "@/lib/api"
import { getSupplier } from "@/lib/api"
import Link from "next/link";

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [priceFilter, setPriceFilter] = useState<string>("all")
    const [suppliers, setSuppliers] = useState<Map<number, string>>(new Map())  // store supplier names by id

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts()
                setProducts(data)

                // Fetch supplier names for each product
                const supplierMap = new Map<number, string>()
                for (const product of data) {
                    if (!supplierMap.has(parseInt(product.supplierId))) {
                        const supplier = await getSupplier(parseInt(product.supplierId))
                        supplierMap.set(parseInt(product.supplierId), supplier.companyName)
                    }
                }
                setSuppliers(supplierMap)
                setFilteredProducts(data)
            } catch (err) {
                setError("Error loading products. Please try again later.")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    useEffect(() => {
        // Apply filters whenever search query or price filter changes
        let result = [...products]

        // Apply search filter
        if (searchQuery) {
            result = result.filter(
                (product) =>
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchQuery.toLowerCase()),
            )
        }

        // Apply price filter
        if (priceFilter !== "all") {
            switch (priceFilter) {
                case "low":
                    result = result.filter((product) => product.price < 50)
                    break
                case "medium":
                    result = result.filter((product) => product.price >= 50 && product.price < 200)
                    break
                case "high":
                    result = result.filter((product) => product.price >= 200)
                    break
            }
        }

        setFilteredProducts(result)
    }, [searchQuery, priceFilter, products])

    const handleAddToCart = (product: Product) => {
        // Get the current cart from localStorage
        const cart = JSON.parse(localStorage.getItem("cart") || "[]")
        // Check if the product is already in the cart
        const existingProduct = cart.find((item: Product) => item.id === product.id)

        if (existingProduct) {
            // If the product is already in the cart, increase the quantity
            existingProduct.quantity += 1
        } else {
            // If the product is not in the cart, add it with a quantity of 1
            cart.push({ ...product, quantity: 1 })
        }

        // Save the updated cart back to localStorage
        localStorage.setItem("cart", JSON.stringify(cart))

        // Notify the user
        alert(`${product.name} added to cart!`)
    }

    if (loading) {
        return <div className="text-center">Loading products...</div>
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-around">
                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input
                            type="text"
                            placeholder="Search products..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="h-4 w-4 text-muted-foreground"/>
                        <Select value={priceFilter} onValueChange={setPriceFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Price Range"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Prices</SelectItem>
                                <SelectItem value="low">Under $50</SelectItem>
                                <SelectItem value="medium">$50 - $200</SelectItem>
                                <SelectItem value="high">$200+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                    <h3 className="text-lg font-medium">No products found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...filteredProducts].reverse().map((product) => (
                        <div key={product.id}>
                            <Link href={`/products/${product.id}`}>
                                <Card className="flex flex-col h-full">
                                    <CardHeader>
                                        <div
                                            className="aspect-square bg-muted rounded-md flex items-center justify-center mb-2">
                                            <img
                                                src={`https://api.dicebear.com/9.x/icons/svg?seed=${encodeURIComponent(product.name)}`}
                                                alt={product.name}
                                                className="object-cover h-full w-full rounded-md"
                                            />
                                        </div>
                                        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-muted-foreground line-clamp-3">{product.description}</p>
                                        <Badge variant="outline" className="mt-2">
                                            Supplier: {suppliers.get(parseInt(product.supplierId)) || "Unknown"}
                                        </Badge>
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center">
                                        <div className="font-bold text-lg">${product.price.toFixed(2)}</div>
                                        <Button size="sm" className="flex items-center gap-1" onClick={() => handleAddToCart(product)}>
                                            <ShoppingCart className="h-4 w-4"/>
                                            Add to Cart
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}