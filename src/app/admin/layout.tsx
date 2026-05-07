
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Dashboard - MindMate-AI',
  description: 'Professional dashboard for MindMate-AI to manage appointments and view trends.',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dark bg-background text-foreground">
        {children}
    </div>
  );
}
