
import { Bell } from "lucide-react";

export default function NotificationsPage() {
    return (
        <div className="p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Bell /> Notifications
                </h1>
                <p className="text-muted-foreground">Your recent alerts and updates will appear here.</p>
            </header>
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-16 border-2 border-dashed rounded-lg">
                <Bell className="w-16 h-16 mb-4" />
                <h2 className="text-lg font-semibold">No new notifications</h2>
                <p>You're all caught up!</p>
            </div>
        </div>
    );
}
