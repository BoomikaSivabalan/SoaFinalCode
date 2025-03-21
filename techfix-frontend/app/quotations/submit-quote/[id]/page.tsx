"use client"

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Loader2} from "lucide-react"
import {getQuotation, Quotation, QuotationProduct, QuotationType, submitQuote} from "@/lib/api";
import {useAuth} from "@/contexts/auth.context";

export default function SubmitQuotePage() {
    const {user, loading:authLoading} = useAuth()
    const params = useParams()
    const router = useRouter()
    const quotationId = Number.parseInt(params.id as string)

    const [quotation, setQuotation] = useState<Quotation | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [notes, setNotes] = useState<string>("")
    const [productPrices, setProductPrices] = useState<Record<number, number>>({})

    useEffect(() => {
        if (authLoading) return;
        const fetchData = async () => {
            try {
                // Fetch quotation
                const quotationData = await getQuotation(quotationId)
                setQuotation(quotationData)

                // Check if this is an RFQ and if the current user is the supplier
                if (quotationData.quotationType !== QuotationType.request) {
                    throw new Error("This is not a request for quotation")
                }

                if (quotationData.supplierId !== user.id) {
                    throw new Error("You are not authorized to submit a quote for this RFQ")
                }

                // Initialize product prices
                const initialPrices: Record<number, number> = {}
                quotationData.quotationProducts.forEach((product) => {
                    initialPrices[product.productId] = 0
                })
                setProductPrices(initialPrices)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user, quotationId])

    const handlePriceChange = (productId: number, price: number) => {
        setProductPrices({
            ...productPrices,
            [productId]: price,
        })
    }

    const handleSubmit = async () => {
        if (!user || !quotation) return

        // Validate prices
        const invalidPrices = Object.values(productPrices).some((price) => price <= 0)
        if (invalidPrices) {
            setError("Please enter valid prices for all products")
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            const products = quotation.quotationProducts.map((product:QuotationProduct) => ({
                productId: product.productId,
                quantity: product.quantity,
                price: productPrices[product.productId],
                id:0,
                quotationId:0
            }))

            await submitQuote({
                adminId: 0,
                quotationProducts: products,
                quotationType: undefined,
                supplierId: user.id,
                notes,
                linkedQuotationId: quotation.id,
            })

            router.push("/quotations")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit quote")
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <Card className="mx-auto max-w-2xl">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => router.push("/quotations")}>Back to Quotations</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (!quotation) return null

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Submit Quote</h1>
                <p className="text-muted-foreground">Responding to Request for Quotation #{quotation.id}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quote Details</CardTitle>
                    <CardDescription>Provide your pricing for the requested products</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {error && <div className="rounded-md bg-destructive/10 p-4 text-destructive">{error}</div>}

                    <div className="rounded-md bg-muted p-4">
                        <h3 className="mb-2 font-medium">Original Request Notes</h3>
                        <p className="text-sm text-muted-foreground">{quotation.notes || "No additional notes provided."}</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Your Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any additional information about your quote"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Products</Label>

                        <div className="space-y-4">
                            {quotation.quotationProducts.map((product:QuotationProduct) => (
                                <div key={product.productId+Math.random()} className="grid grid-cols-12 gap-4 rounded-md border p-4">
                                    <div className="col-span-6">
                                        <Label className="mb-1 block text-sm font-medium">Product</Label>
                                        <div className="text-base">
                                            {/* In a real app, you would fetch the product name */}
                                            Product ID: {product.productId}
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">Quantity: {product.quantity}</div>
                                    </div>

                                    <div className="col-span-6">
                                        <Label htmlFor={`price-${product.productId}`} className="mb-1 block text-sm font-medium">
                                            Your Price (per unit)
                                        </Label>
                                        <Input
                                            id={`price-${product.productId}`}
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={productPrices[product.productId] || ""}
                                            onChange={(e) => handlePriceChange(product.productId, Number.parseFloat(e.target.value))}
                                        />
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            Total: ${((productPrices[product.productId] || 0) * product.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-2 border-t p-6">
                    <Button variant="outline" onClick={() => router.push("/quotations")} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Quote"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

