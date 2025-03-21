"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

interface DeleteProductDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onDelete: () => Promise<void>
    isLoading: boolean
    productName: string
}

export function DeleteProductDialog({
                                        open,
                                        onOpenChange,
                                        onDelete,
                                        isLoading,
                                        productName,
                                    }: DeleteProductDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete{" "}
                        <span className="font-medium">{productName}</span> and remove it from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading} className={"text-md"}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async (e) => {
                            e.preventDefault()
                            await onDelete()
                        }}
                        disabled={isLoading}
                        className="bg-destructive text-red-950 text-md hover:bg-destructive/90"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

