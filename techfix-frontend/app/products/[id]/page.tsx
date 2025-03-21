import { Suspense } from "react";
import ProductDetails from "./product-details";
import ProductLoading from "./loading";
import { Metadata } from "next";
import {getProduct} from "@/lib/api";

interface Props {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const product = await getProduct(parseInt(params.id));

        return {
            title: `${product.name} - TechFix`,
            description: product.description,
        };
    } catch (error) {
        return {
            title: 'Product - TechFix',
            description: 'Product details',
        };
    }
}

export default function ProductPage({ params }: Props) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<ProductLoading />}>
                <ProductDetails id={parseInt(params.id)} />
            </Suspense>
        </div>
    );
}
