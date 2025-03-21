// components/LogoutButton.tsx
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth.context";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        // Remove token from localStorage on logout
        localStorage.removeItem("token");

        logout();  // Ensure logout logic is also executed
        router.push("/login");  // Redirect to login page
    };

    return (
        <Button
            onClick={handleLogout}
            className="hover:bg-red-500 hover:text-red-950 text-white mb"
        >
            Logout
        </Button>
    );
}
