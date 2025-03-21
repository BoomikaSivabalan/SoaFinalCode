import QuotationList from "@/components/quotation-list";
import AuthGuard from "@/components/authGuard";

export default function QuotationPage() {
    return (
        <AuthGuard>
            <QuotationList/>
        </AuthGuard>
    );
}