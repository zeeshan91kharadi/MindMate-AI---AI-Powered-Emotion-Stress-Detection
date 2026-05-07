
import { ProfessionalDashboard } from "@/components/admin/professional-dashboard";
import { Suspense } from "react";

export default function AdminPage() {
    return (
        <Suspense>
            <ProfessionalDashboard />
        </Suspense>
    )
}

