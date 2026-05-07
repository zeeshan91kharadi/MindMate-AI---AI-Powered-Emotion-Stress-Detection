
import { FamilyHubPage } from "@/components/family-hub/family-hub-page";
import { HeartHandshake } from "lucide-react";

export default function FamilyHub() {
    return (
        <div className="p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <HeartHandshake /> Family Hub
                </h1>
                <p className="text-muted-foreground">Manage your family connections for support notifications.</p>
            </header>
            <FamilyHubPage />
        </div>
    );
}
