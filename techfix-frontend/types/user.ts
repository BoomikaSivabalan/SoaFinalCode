// types/auth.ts
export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    companyName?: string;
}

export enum UserRole {
    admin = 'Admin',
    supplier = 'Supplier',
}