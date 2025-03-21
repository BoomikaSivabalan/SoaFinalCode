import { API_URI } from "@/lib/env.config";
import { User } from "@/types/user";

export interface Product {
    quantity?: any;
    id: number;
    name: string;
    price: number;
    description: string;
    supplierId: string;
}

export interface Inventory {
    id?: number;
    productId: number;
    quantity: number;
}

export enum QuotationType {
    request = 0,
    quote = 1,
}

export interface QuotationProduct {
    id: number;
    productId: number;
    quotationId: number;
    quantity: number;
    price: number;
}

export interface Quotation {
    id: number;
    adminId: number;
    supplierId: number;
    createdDate: string;
    rfqStatus: RFQStatus;
    quotationType: QuotationType;
    linkedQuotationId?: number | null;
    notes: string;
    quotationProducts: QuotationProduct[];
}

// New Models
export interface Purchase {
    id: number;
    userId: number;
    purchaseDate: string;
    totalAmount: number;
    purchaseItems: PurchaseItem[];
}

export interface PurchaseItem {
    id: number;
    purchaseId: number;
    productId: number;
    quantity: number;
    price: number;
}

export interface InventoryChange {
    id: number;
    productId: number;
    quantityChange: number;
    changeDate: string;
    reason: ChangeReason;
    purchaseId?: number;
}

export enum ChangeReason {
    Supply = 0,
    Purchase = 1,
}

export enum RFQStatus {
    Pending = 0,
    Approved = 1,
    Declined = 2,
}

// Products API
export async function getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URI}/products`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return response.json();
}

export async function getProduct(id: number): Promise<Product> {
    const response = await fetch(`${API_URI}/products/${id}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
    }

    return response.json();
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_URI}/products/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to update product: ${response.status}`);
    }

    return response.json();
}

export async function deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${API_URI}/products/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.status}`);
    }
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_URI}/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to create product: ${response.status}`);
    }

    return response.json();
}

export async function getSuppliers(): Promise<User[]> {
    const response = await fetch(`${API_URI}/Supplier`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch suppliers: ${response.status}`);
    }

    return response.json();
}

export async function getSupplier(id: number): Promise<User> {
    const response = await fetch(`${API_URI}/Supplier/${id}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch supplier: ${response.status}`);
    }

    return response.json();
}

export async function getProductsBySupplier(supplierId: number): Promise<Product[]> {
    const response = await fetch(`${API_URI}/supplier/${supplierId}/products`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch products for supplier: ${response.status}`);
    }

    return response.json();
}

export async function createRFQ(request: Omit<Quotation, "id" | "createdDate" | "rfqStatus">): Promise<Quotation> {
    const response = await fetch(`${API_URI}/quotations/rfq`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to create RFQ: ${response.status}`);
    }

    return response.json();
}

export async function submitQuote(request: Omit<Quotation, "id" | "createdDate" | "rfqStatus">): Promise<Quotation> {
    const response = await fetch(`${API_URI}/quotations/submit-quote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to submit quote: ${response.status}`);
    }

    return response.json();
}

export async function getQuotations(): Promise<Quotation[]> {
    const response = await fetch(`${API_URI}/quotations`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch quotations: ${response.status}`);
    }

    return response.json();
}

export async function getQuotesLinkedToRFQ(rfqId: number): Promise<Quotation[]> {
    const response = await fetch(`${API_URI}/quotations/rfq/${rfqId}/quotes`, {
        credentials: "include",
    });

    if (response.status === 404) {
        return [];
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch quotes linked to RFQ: ${response.status}`);
    }

    return response.json();
}

export async function getQuotation(id: number): Promise<Quotation> {
    const response = await fetch(`${API_URI}/quotations/${id}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch quotation: ${response.status}`);
    }

    return response.json();
}

export async function approveQuotation(id: number): Promise<void> {
    const response = await fetch(`${API_URI}/quotations/${id}/approve`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to approve quotation: ${response.status}`);
    }
}

export async function declineQuotation(id: number): Promise<void> {
    const response = await fetch(`${API_URI}/quotations/${id}/decline`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to decline quotation: ${response.status}`);
    }
}

// Inventory API
export async function getInventoryByProductId(productId: number): Promise<Inventory> {
    const response = await fetch(`${API_URI}/inventory/product/${productId}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.status}`);
    }

    return response.json();
}

export async function getAllInventoryByProductId(): Promise<Inventory> {
    const response = await fetch(`${API_URI}/inventory/product/`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.status}`);
    }

    return response.json();
}

export async function createInventory(inventory: Omit<Inventory, "id">): Promise<Inventory> {
    const response = await fetch(`${API_URI}/inventory`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(inventory),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to create inventory: ${response.status}`);
    }

    return response.json();
}

export async function updateInventory(productId: number, quantityToAdd: number): Promise<Inventory> {
    const response = await fetch(`${API_URI}/inventory/product/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantityToAdd }),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to update inventory: ${response.status}`);
    }

    return response.json();
}

export async function bulkUpdateInventory(updates: { productId: number; quantityToAdd: number }[]): Promise<void> {
    const response = await fetch(`${API_URI}/inventory/bulk-update`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to bulk update inventory: ${response.status}`);
    }
}

// Purchase API
export async function createPurchase(request: PurchaseRequest): Promise<Purchase> {
    const response = await fetch(`${API_URI}/purchases`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to create purchase: ${response.status}`);
    }

    return response.json();
}

export async function getPurchases(): Promise<Purchase[]> {
    const response = await fetch(`${API_URI}/purchases`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch purchases: ${response.status}`);
    }

    return response.json();
}

export async function getPurchaseById(id: number): Promise<Purchase> {
    const response = await fetch(`${API_URI}/purchases/${id}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch purchase: ${response.status}`);
    }

    return response.json();
}

export async function getPurchasesByUser(userId: number): Promise<Purchase[]> {
    const response = await fetch(`${API_URI}/purchases/user/${userId}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch purchases for user: ${response.status}`);
    }

    return response.json();
}

// Inventory Change API
export async function getInventoryChanges(productId?: number): Promise<InventoryChange[]> {
    const response = await fetch(`${API_URI}/inventory/changes/${productId}`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch inventory changes: ${response.status}`);
    }

    return response.json();
}

export async function getAllInventoryChanges(): Promise<InventoryChange[]> {
    const response = await fetch(`${API_URI}/inventory/changes`, {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch inventory changes: ${response.status}`);
    }

    return response.json();
}

export async function addStock(request: AddStockRequest): Promise<void> {
    const response = await fetch(`${API_URI}/inventory/add-stock`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to add stock: ${response.status}`);
    }
}

// DTOs
export interface PurchaseRequest {
    userId: number;
    purchaseItems: PurchaseItemRequest[];
}

export interface PurchaseItemRequest {
    productId: number;
    quantity: number;
    price: number;
}

export interface AddStockRequest {
    productId: number;
    quantity: number;
}