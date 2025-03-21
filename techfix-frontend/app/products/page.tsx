
import {Suspense} from "react";
import ProductList from "@/components/product-list";
import ProductsLoading from "@/components/product-loading";
import {CreateProductButton} from "@/components/create-product-button";

export default function Home() {
  return (
          <div className="container mx-auto px-4 py-8">
              <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold">TechFix Products</h1>
                    <div className="flex gap-4">
                        <CreateProductButton/>
                    </div>
              </div>
              <Suspense fallback={<ProductsLoading/>}>
                  <ProductList/>
              </Suspense>
          </div>
  );
}
