
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Trash, Plus } from 'lucide-react';
import { format, isBefore, startOfDay } from "date-fns";
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  userId: string;
  appointmentDate: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  userName?: string;
}

const mockAppointments: Appointment[] = [
    { id: 'apt1', userId: 'user1', userName: 'John Doe', appointmentDate: new Date('2024-08-01T09:00:00'), status: 'scheduled' },
    { id: 'apt2', userId: 'user2', userName: 'Jane Smith', appointmentDate: new Date('2024-08-01T11:00:00'), status: 'scheduled' },
    { id: 'apt3', userId: 'user3', userName: 'Peter Jones', appointmentDate: new Date('2024-08-05T14:00:00'), status: 'scheduled' },
];

export function ManageAppointments() {
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availability, setAvailability] = useState<{ time: string; available: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const appointmentsLoading = false;
  const appointmentsWithUserNames = mockAppointments;

  const handleTimeSlotChange = (index: number, time: string) => {
    const newAvailability = [...availability];
    newAvailability[index].time = time;
    setAvailability(newAvailability);
  };

  const addTimeSlot = () => {
    setAvailability((prev) => [...prev, { time: '', available: true }]);
  };

  const removeTimeSlot = (index: number) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const saveAvailability = async () => {
    setIsLoading(true);
    const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    setTimeout(() => {
        toast({
            title: 'Availability Saved!',
            description: `Your schedule for ${formattedDate} has been updated.`,
        });
        setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 py-8">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Set Your Availability</CardTitle>
          <CardDescription>
            Select a date and add your available time slots.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
              className="p-0 rounded-md border flex justify-center"
            />
          </div>

          <div className="space-y-3">
            <p className="font-medium text-sm">
              Time Slots for{' '}
              {selectedDate ? format(selectedDate, 'PPP') : '...'}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {availability.map((slot, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={slot.time}
                    onChange={(e) =>
                      handleTimeSlotChange(index, e.target.value)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTimeSlot(index)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
               {availability.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No slots added for this day.</p>}
            </div>

            <Button variant="outline" size="sm" onClick={addTimeSlot}>
              <Plus className="mr-2 h-4 w-4" /> Add Time Slot
            </Button>

            <Button
              onClick={saveAvailability}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Availability
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>
            Here are your scheduled appointments.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {appointmentsLoading && (
            <Loader2 className="animate-spin mx-auto my-4 h-6 w-6" />
          )}

          {!appointmentsLoading && (!appointmentsWithUserNames || appointmentsWithUserNames.length === 0) && (
            <p className="text-muted-foreground text-center">
              No upcoming appointments.
            </p>
          )}

          <div className="space-y-2 max-h-[25rem] overflow-y-auto">
            {appointmentsWithUserNames?.map((apt) => (
              <div
                key={apt.id}
                className="flex justify-between items-center p-3 rounded-lg bg-background/50"
              >
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {apt.userName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(apt.appointmentDate, 'PPP, p')}
                  </p>
                </div>
                <Badge
                  variant={
                    apt.status === 'scheduled' ? 'default' : 'secondary'
                  }
                >
                  {apt.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
