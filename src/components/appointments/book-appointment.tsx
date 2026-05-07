
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Professional {
    id: string;
    displayName: string;
    email?: string;
    photoURL?: string;
    role: 'professional';
}

const mockProfessionals: Professional[] = [
    { id: 'prof1', displayName: 'Dr. Evelyn Reed', email: 'e.reed@example.com', photoURL: 'https://i.pravatar.cc/150?u=prof1', role: 'professional' },
    { id: 'prof2', displayName: 'Dr. Marcus Thorne', email: 'm.thorne@example.com', photoURL: 'https://i.pravatar.cc/150?u=prof2', role: 'professional' },
];

const mockAvailability = {
    'prof1': {
        '2024-08-01': [{ time: '09:00', available: true }, { time: '10:00', available: false }, { time: '11:00', available: true }],
        '2024-08-05': [{ time: '14:00', available: true }, { time: '15:00', available: true }],
    },
    'prof2': {
        '2024-08-01': [{ time: '09:30', available: true }, { time: '10:30', available: true }],
        '2024-08-02': [{ time: '13:00', available: true }, { time: '14:00', available: false }, { time: '15:00', available: true }],
    }
}


export function BookAppointment() {
    const { toast } = useToast();
    
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isBooking, setIsBooking] = useState(false);

    const professionals = mockProfessionals;
    const professionalsLoading = false;

    const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    const availability = selectedProfessional ? (mockAvailability as any)[selectedProfessional.id]?.[formattedDate] : [];
    const availabilityLoading = false;


    const handleBooking = async () => {
        if (!selectedProfessional || !selectedDate || !selectedTime) {
            toast({ variant: 'destructive', title: 'Please select all fields.' });
            return;
        }

        setIsBooking(true);
        
        setTimeout(() => {
            toast({ title: 'Appointment Booked!', description: `Your appointment with ${selectedProfessional.displayName} is confirmed for ${selectedTime}.` });
            setSelectedTime(null);
            setIsBooking(false);
        }, 1000);
    };

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card md:col-span-1">
                <CardHeader><CardTitle>1. Select a Professional</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {professionalsLoading && <Loader2 className="animate-spin mx-auto" />}
                    {professionals?.map(prof => (
                        <Button key={prof.id} variant={selectedProfessional?.id === prof.id ? 'default' : 'outline'} className="w-full justify-start gap-3 h-auto py-2" onClick={() => setSelectedProfessional(prof)}>
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={prof.photoURL} />
                                <AvatarFallback>{prof.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                                <p className="font-semibold">{prof.displayName}</p>
                                <p className="text-xs text-muted-foreground">{prof.email}</p>
                            </div>
                        </Button>
                    ))}
                </CardContent>
            </Card>

            <Card className="glass-card md:col-span-1">
                <CardHeader><CardTitle>2. Select a Date</CardTitle></CardHeader>
                <CardContent>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            setSelectedDate(date);
                            setSelectedTime(null);
                        }}
                        disabled={(date) => date < new Date() || !selectedProfessional}
                        className="p-0 flex justify-center"
                    />
                </CardContent>
            </Card>

            <Card className="glass-card md:col-span-1">
                <CardHeader><CardTitle>3. Select a Time</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {availabilityLoading && <Loader2 className="animate-spin mx-auto" />}
                    {!availabilityLoading && !availability && selectedProfessional && (
                        <p className="text-muted-foreground text-center text-sm py-4">This professional has not set their availability for this date.</p>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                        {availability?.map((slot: {time: string, available: boolean}) => (
                            <Button key={slot.time} variant={selectedTime === slot.time ? 'default' : 'outline'} disabled={!slot.available} onClick={() => setSelectedTime(slot.time)}>
                                {slot.time}
                            </Button>
                        ))}
                    </div>
                    {selectedTime && (
                         <Button onClick={handleBooking} disabled={isBooking} className="w-full mt-4">
                            {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Book Appointment
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
