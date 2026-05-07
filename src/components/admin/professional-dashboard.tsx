
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDashboard } from "./admin-dashboard";
import { ManageAppointments } from "../appointments/manage-appointments";
import { CalmSenseLogo } from "../icons";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


export function ProfessionalDashboard() {
  return (
    <div className="min-h-screen p-4 md:p-8">
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
            <CalmSenseLogo className="w-10 h-10 text-primary" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Professional Dashboard</h1>
                <p className="text-muted-foreground">Manage appointments and view user trends.</p>
            </div>
            </div>
            <Button asChild variant="outline">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to App
            </Link>
            </Button>
      </header>
        <Tabs defaultValue="appointments">
            <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
                <TabsTrigger value="trends">Stress Trends</TabsTrigger>
                <TabsTrigger value="appointments">Manage Appointments</TabsTrigger>
            </TabsList>
            <TabsContent value="trends">
                <AdminDashboard />
            </TabsContent>
            <TabsContent value="appointments">
                <ManageAppointments />
            </TabsContent>
        </Tabs>
    </div>
  );
}
