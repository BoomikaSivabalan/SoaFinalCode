"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth.context"
import {UserRole} from "@/types/user";
import {CreateProductDialog} from "@/components/create-product-dialog";

export function CreateProductButton() {
    const [open, setOpen] = useState(false)
    const { user } = useAuth()

    // Only show button for admin users
    if (user?.role !== UserRole.admin) {
        return null
    }

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
            </Button>
            <CreateProductDialog open={open} onOpenChange={setOpen} />
        </>
    )
}

