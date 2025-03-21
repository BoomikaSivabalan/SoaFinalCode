"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Badge} from "@/components/ui/badge"
import {format} from "date-fns"
import {FileText, Loader2, Send} from 'lucide-react'
import {getQuotations, Quotation, QuotationType, RFQStatus} from "@/lib/api";
import {UserRole} from "@/types/user";
import {useAuth} from "@/contexts/auth.context";

export default function QuotationList() {
    const {user} = useAuth()
    const [quotations, setQuotations] = useState<Quotation[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("all")
    const router = useRouter()

    // Fetch the current user and quotations
    useEffect(() => {
        const fetchUserAndQuotations = async () => {
            try {
                const quotationsData = await getQuotations()
                setQuotations(quotationsData)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchUserAndQuotations()
    }, [])

    // Filter quotations based on user role and active tab
    const filteredQuotations = quotations.filter(quotation => {
        // If user is not admin, only show quotations where they are the supplier
        if (user && user.role !== UserRole.admin) {
            return quotation.supplierId === user.id
        }

        // For admins with "submitted" tab active
        if (activeTab === "submitted") {
            return quotation.quotationType === QuotationType.quote // Assuming "QUOTE" is the type for submitted quotations
        }

        // For admins with "all" tab
        return true
    })

    const handleCreateRFQ = () => {
        router.push("/quotations/create-rfq")
    }

    if (loading || user === null) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <span className="ml-2">Loading quotations...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center">
                <p className="text-destructive">Error: {error}</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </Button>
            </div>
        )
    }

    const isAdmin = user?.role === UserRole.admin// Assuming 0 is admin role

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Quotations</h1>

                {isAdmin && (
                    <div className="flex gap-2">
                        <Button onClick={handleCreateRFQ} className="flex items-center gap-2">
                            <FileText className="h-4 w-4"/>
                            Create RFQ
                        </Button>
                    </div>
                )}
            </div>

            {isAdmin ? (
                <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="all">All Quotations</TabsTrigger>
                        <TabsTrigger value="submitted">Submitted Quotations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        {renderQuotationsList(filteredQuotations, isAdmin)}
                    </TabsContent>

                    <TabsContent value="submitted" className="space-y-4">
                        {renderQuotationsList(filteredQuotations, isAdmin)}
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="space-y-4">
                    {renderQuotationsList(filteredQuotations, isAdmin)}
                </div>
            )}
        </div>
    )
}

function renderQuotationsList(quotations: Quotation[], isAdmin: boolean) {
    if (quotations.length === 0) {
        return (
            <div
                className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">No quotations found</p>
                {isAdmin && (
                    <Button variant="link" className="mt-2"
                            onClick={() => window.location.href = "/quotations/create-rfq"}>
                        Create your first RFQ
                    </Button>
                )}
            </div>
        )
    }

    return quotations.map((quotation) => (
        <QuotationCard key={quotation.id} quotation={quotation} isAdmin={isAdmin}/>
    ))
}

function QuotationCard({quotation, isAdmin}: { quotation: Quotation; isAdmin: boolean }) {
    const router = useRouter()

    const handleViewDetails = () => {
        router.push(`/quotations/${quotation.id}`)
    }

    const handleSubmitQuote = () => {
        router.push(`/quotations/submit-quote/${quotation.id}`)
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 bg-muted/20">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        Quotation #{quotation.id}
                        <QuotationStatusBadge quotation={quotation}/>
                    </CardTitle>
                    <CardDescription>
                        Created on {format(new Date(quotation.createdDate), "PPP")}
                    </CardDescription>
                </div>
                <QuotationTypeBadge quotation={quotation}/>
            </CardHeader>

            <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <h3 className="mb-2 font-semibold">Details</h3>
                        <p className="text-sm text-muted-foreground">
                            {quotation.notes || "No additional notes provided."}
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-2 font-semibold">Products</h3>
                        <p className="text-sm text-muted-foreground">
                            {quotation.quotationProducts.length} product(s) included
                        </p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2 border-t bg-muted/10 p-4">
                <Button variant="outline" onClick={handleViewDetails}>
                    View Details
                </Button>
                {!isAdmin && quotation.quotationType === QuotationType.request && !quotation.linkedQuotationId && (
                    <Button onClick={handleSubmitQuote} className="flex items-center gap-2">
                        <Send className="h-4 w-4"/>
                        Submit Quote
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

function QuotationStatusBadge({quotation}: { quotation: Quotation }) {
    if (quotation.quotationType == QuotationType.request) {
        return <Badge variant="outline">Request Quote</Badge>
    } else if (quotation.rfqStatus === RFQStatus.Pending) {
        return <Badge variant="secondary">Pending</Badge>
    } else if (quotation.rfqStatus === RFQStatus.Declined) {
        return <Badge variant="destructive">Declined</Badge>
    } else if (quotation.rfqStatus === RFQStatus.Approved) {
        return <Badge className="bg-green-500">Approved</Badge>
    }
}

function QuotationTypeBadge({quotation}: { quotation: Quotation }) {
    if (quotation.quotationType === QuotationType.request) {
        return <Badge variant="secondary">Request for Quotation</Badge>
    } else if (quotation.quotationType === QuotationType.quote) {
        return <Badge className="bg-blue-500">Submitted Quote</Badge>
    } else {
        return <Badge variant="outline">{quotation.quotationType}</Badge>
    }
}
