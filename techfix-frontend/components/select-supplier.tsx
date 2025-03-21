"use client"

import { useEffect, useState } from "react"
import { getSuppliers } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {User} from "@/types/user";

interface SupplierSelectProps {
    value: string
    onValueChange: (value: string) => void
    disabled?: boolean
}

export function SupplierSelect({ value, onValueChange, disabled }: SupplierSelectProps) {
    const [suppliers, setSuppliers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const data = await getSuppliers()
                setSuppliers(data)
            } catch (err) {
                setError("Failed to load suppliers")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchSuppliers()
    }, [])

    if (loading) {
        return (
            <Select disabled>
                <SelectTrigger>
                    <SelectValue placeholder="Loading suppliers..." />
                </SelectTrigger>
            </Select>
        )
    }

    if (error) {
        return (
            <Select disabled>
                <SelectTrigger>
                    <SelectValue placeholder="Error loading suppliers" />
                </SelectTrigger>
            </Select>
        )
    }

    return (
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
            </SelectTrigger>
            <SelectContent>
                {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.username}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

