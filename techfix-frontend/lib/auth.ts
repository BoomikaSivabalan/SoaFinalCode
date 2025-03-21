import {API_URI} from "@/lib/env.config";
import {User, UserRole} from "@/types/user";
import {apiFetch, ApiResponse} from "@/services/api.service";

export async function register(
    username: string,
    password: string,
    email: string,
    companyName: string
): Promise<{ message: string }> {
    const res = await fetch(`${API_URI}/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            password,
            email,
            companyName,
            role: 1,
        }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
    }

    return res.json();
}

export async function login(inputUsername: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_URI}/Auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username: inputUsername, password}),
    });

    if (!res.ok) throw new Error("Login failed");

    const {id, username, role, email, token, companyName} = await res.json();
    const user: User = { id, username, role, email, companyName};
    return {user, token};
}

export async function logout() {
    localStorage.removeItem("token");
    return apiFetch("/Auth/logout", {method: "POST"});
}

export async function getUser(token: string) {
    if (!token) return null;
    try {
        const response: ApiResponse<User> = await apiFetch<User>("/Auth/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch {
        return null;
    }
}
