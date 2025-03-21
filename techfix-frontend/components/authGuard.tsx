// components/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth.context";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        if (!loading && !user && !redirecting) {
            setRedirecting(true);
            router.replace("/login"); // Use replace instead of push to avoid history stacking
        }
    }, [user, loading, router, redirecting]);

    if (loading || redirecting) return <p>Loading...</p>;

    return <>{children}</>;
}
