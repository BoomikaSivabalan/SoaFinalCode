import {API_URI} from "@/lib/env.config";

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_URI}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
                ...(options.headers || {}),
            },
            credentials: "include",
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            return { error: errorData?.message || `API Error: ${res.status}` };
        }

        const data = await res.json();
        return { data };
    } catch (error) {
        return { error: "Network error. Please try again." };
    }
}