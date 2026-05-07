
import { BookAppointment } from "@/components/appointments/book-appointment";
import { CalendarPlus } from "lucide-react";

export default function BookAppointmentPage() {
    return (
        <div className="p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <CalendarPlus/> Book an Appointment
                </h1>
                <p className="text-muted-foreground">Find an available healthcare professional.</p>
            </header>
            <BookAppointment />
        </div>
    )
}
