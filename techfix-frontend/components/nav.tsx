"use client"

import Link from "next/link";
import {Button} from "@/components/ui/button";
import LogoutButton from "@/components/logoutButton";
import {useAuth} from "@/contexts/auth.context";
import React from "react";
import {ShoppingCart} from "lucide-react";

export default function Nav() {
    const pages = [
        {name: "Dashboard", href: "/"},
        {name: "Products", href: "/products"},
        {name: "Quotations", href: "/quotations"},
        {name: "Suppliers", href: "/suppliers"},
        {name: "Create RFQ", href: "/quotations/create-rfq"},
    ];

    const {user} = useAuth(); // Get the user from Auth context

    return (
        <nav className="bg-background border-b p-4">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-lg font-bold">
                        TechFix
                    </Link>
                    <div className="hidden md:flex items-center gap-4">
                        {pages.map((page) => (
                            <Link key={page.name} href={page.href}>
                                <Button variant="ghost">{page.name}</Button>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4">

                    {user ? (
                        // Show logout button only if the user is logged in
                        <div>
                            <Link href={"/cart"} className={"mx-2"}>
                                <Button variant={"outline"} size={"icon"}>
                                    <ShoppingCart/>
                                </Button>
                            </Link>
                            <LogoutButton />
                        </div>
                    ) : (
                        // You can place a login button or other elements here if needed
                        <div>
                            <Link href="/login" className={"mx-2"}>
                                <Button variant="default">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="default">Register</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
