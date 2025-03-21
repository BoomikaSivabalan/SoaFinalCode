"use client";

import {useParams, useRouter} from "next/navigation";
import {useAuth} from "@/contexts/auth.context";
import {useEffect, useState} from "react";
import {
    approveQuotation,
    bulkUpdateInventory,
    declineQuotation,
    getQuotation,
    getQuotesLinkedToRFQ,
    Quotation,
    QuotationType, RFQStatus,
} from "@/lib/api";
import {ArrowLeft, Badge, CheckCircle, Loader2, XCircle} from "lucide-react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {UserRole} from "@/types/user";
import {format} from "date-fns";
import {Separator} from "@radix-ui/react-select";
import {toast} from "sonner";

export default function QuotationDetailsPage() {
    const { user, loading: authLoading } = useAuth();
    const params = useParams();
    const router = useRouter();
    const quotationId = Number(params.id);

    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [linkedQuotation, setLinkedQuotation] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || isNaN(quotationId)) return; // Wait for authentication and validate ID

        const fetchData = async () => {
            try {
                setLoading(true);
                const quotationData = await getQuotation(quotationId);
                setQuotation(quotationData);

                if (quotationData.linkedQuotationId) {
                    const linkedData = await getQuotation(quotationData.linkedQuotationId);
                    setLinkedQuotation(linkedData);
                }

                if (quotationData.quotationType === QuotationType.request) {
                    const quotesResponse = await getQuotesLinkedToRFQ(quotationData.id);
                    if (quotesResponse.length > 0) {
                        setLinkedQuotation(quotesResponse[0]);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authLoading, quotationId]);

    const handleApprove = async () => {
        if (!quotation) return;

        setActionLoading(true);
        setError(null);

        try {
            // Approve the quotation
            await approveQuotation(quotation.id);

            // If the quotation is a quote (not an RFQ), update the inventory
            if (quotation.quotationType === QuotationType.quote) {
                try {
                    // Create inventory updates from quotation products
                    const inventoryUpdates = quotation.quotationProducts.map((product) => ({
                        productId: product.productId,
                        quantityToAdd: product.quantity, // Use `quantityToAdd` instead of `quantity`
                    }));

                    // Update inventory in bulk
                    if (inventoryUpdates.length > 0) {
                        await bulkUpdateInventory(inventoryUpdates);
                    }
                } catch (inventoryError) {
                    console.error("Failed to update inventory:", inventoryError);
                    // Log the error and notify the user (optional)
                    toast("Warning", {
                        description: "Quotation approved, but inventory update failed. Please check the inventory manually.",
                    });
                }
            }

            // Refresh the quotation data
            const updatedQuotation = await getQuotation(quotation.id);
            setQuotation(updatedQuotation);

            // Notify the user of success
            toast("Success", {
                description: "Quotation approved successfully.",
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to approve quotation");
            toast("Error", {
                description: "Failed to approve quotation. Please try again.",
            });
        } finally {
            setActionLoading(false);
        }
    };
    const handleDecline = async () => {
        if (!quotation) return

        setActionLoading(true)
        setError(null)

        try {
            await declineQuotation(quotation.id)
            // Refresh the quotation data
            const updatedQuotation = await getQuotation(quotation.id)
            setQuotation(updatedQuotation)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to decline quotation")
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <span className="ml-2">Loading quotation details...</span>
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

    const isAdmin = user?.role === UserRole.admin // Assuming 0 is admin role
    const canApprove = isAdmin && quotation.quotationType === QuotationType.quote && quotation.rfqStatus !== RFQStatus.Approved

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6 flex items-center">
                <Button variant="ghost" className="mr-4" onClick={() => router.push("/quotations")}>
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back
                </Button>
                <h1 className="text-3xl font-bold">
                    {QuotationType.request ? "Request for Quotation" : "Quotation"} #{quotation.id}
                </h1>
                <QuotationStatusBadge quotation={quotation} className="ml-4"/>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                            <CardDescription>Created
                                on {format(new Date(quotation.createdDate), "PPP")}</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {error && <div className="rounded-md bg-destructive/10 p-4 text-destructive">{error}</div>}

                            <div>
                                <h3 className="mb-2 font-semibold">Notes</h3>
                                <p className="text-muted-foreground">{quotation.notes || "No additional notes provided."}</p>
                            </div>

                            <Separator/>

                            <div>
                                <h3 className="mb-4 font-semibold">Products</h3>
                                <div className="space-y-4">
                                    {quotation.quotationProducts.map((product) => (
                                        <div key={product.id} className="grid grid-cols-12 gap-4 rounded-md border p-4">
                                            <div className="col-span-6">
                                                <div className="font-medium">
                                                    {/* In a real app, you would fetch the product name */}
                                                    Product ID: {product.productId}
                                                </div>
                                            </div>

                                            <div className="col-span-3 text-right">
                                                <div className="text-sm text-muted-foreground">Quantity</div>
                                                <div>{product.quantity}</div>
                                            </div>

                                            <div className="col-span-3 text-right">
                                                <div className="text-sm text-muted-foreground">Price</div>
                                                <div>
                                                    {product.price > 0 ? (
                                                        <>
                                                            ${product.price.toFixed(2)} per unit
                                                            <div className="text-sm text-muted-foreground">
                                                                Total: ${(product.price * product.quantity).toFixed(2)}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        "Not specified"
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {linkedQuotation && (
                                <>
                                    <Separator/>

                                    <div>
                                        <h3 className="mb-4 font-semibold">
                                            {quotation.quotationType === QuotationType.request? "Submitted Quote" : "Original RFQ"}
                                        </h3>
                                        <Card>
                                            <CardHeader className="bg-muted/20 py-3">
                                                <CardTitle className="text-base">
                                                    {quotation.quotationType === QuotationType.request? "Quote" : "RFQ"} #{linkedQuotation.id}
                                                    <QuotationStatusBadge quotation={linkedQuotation} className="ml-2"/>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/quotations/${linkedQuotation.id}`)}
                                                >
                                                    View Details
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </>
                            )}
                        </CardContent>

                        {canApprove && (
                            <CardFooter className="flex justify-end gap-2 border-t p-6">
                                <Button
                                    variant="outline"
                                    onClick={handleDecline}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <XCircle className="h-4 w-4"/>
                                    Decline
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                >
                                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin"/> :
                                        <CheckCircle className="h-4 w-4"/>}
                                    Approve
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                                <p>{quotation.quotationType === QuotationType.request? "Request for Quotation" : "Submitted Quote"}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                                <p>
                                    {quotation.rfqStatus === RFQStatus.Approved ? "Approved" : quotation.rfqStatus === RFQStatus.Declined ? "Declined" : "Pending"}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Admin</h3>
                                <p>
                                    {/* In a real app, you would fetch the admin name */}
                                    Admin ID: {quotation.adminId}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>
                                <p>
                                    {/* In a real app, you would fetch the supplier name */}
                                    Supplier ID: {quotation.supplierId}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                                <p>{format(new Date(quotation.createdDate), "PPP")}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function QuotationStatusBadge({quotation, className = ""}: { quotation: Quotation; className?: string }) {
    console.log(quotation.rfqStatus)
    if (quotation.rfqStatus === RFQStatus.Approved) {
        return <Badge className={`bg-green-500 ${className}`}>Approved</Badge>
    } else if (quotation.rfqStatus === RFQStatus.Declined) {
        return (
            <Badge className={className}>
                Declined
            </Badge>
        )
    } else {
        return (
            <Badge className={className}>
                Pending
            </Badge>
        )
    }
}

