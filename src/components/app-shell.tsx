
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  BookText,
  Wind,
  MessageCircle,
  Settings,
  Shield,
  LogOut,
  PanelLeft,
  Loader2,
  Users,
  CalendarPlus,
  HeartHandshake,
  Bell,
} from 'lucide-react';
import { CalmSenseLogo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';


const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/journal', label: 'Mood Journal', icon: BookText },
  { href: '/relax', label: 'Relax', icon: Wind },
  { href: '/chat', label: 'AI Primary Psychologist', icon: MessageCircle },
  { href: '/community', label: 'Anonymous Community', icon: Users },
  { href: '/book-appointment', label: 'Book Appointment', icon: CalendarPlus },
  { href: '/family-hub', label: 'Family Hub', icon: HeartHandshake },
];

const bottomNavItems = [
  { href: '/admin', label: 'Professional Dashboard', icon: Shield, role: 'professional' },
];

const authRoutes = ['/login', '/signup'];

interface UserProfile {
    role: 'user' | 'professional';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (!isUserLoading) {
      if (user && authRoutes.includes(pathname)) {
        router.replace('/');
      } else if (!user && !authRoutes.includes(pathname)) {
        router.replace('/login');
      }
    }
  }, [user, isUserLoading, pathname, router]);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
  };
  
  if (isUserLoading || (!user && !authRoutes.includes(pathname))) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authRoutes.includes(pathname)) {
    return <>{children}</>;
  }


  const sidebarContent = (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <CalmSenseLogo className="w-8 h-8 text-primary" />
          <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">
            MindMate AI
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
             // @ts-ignore
             if (item.role && item.role !== userProfile?.role) {
                return null;
            }
            // Hide 'Book Appointment' and 'Family Hub' for professionals
            if (
              (item.href === '/book-appointment' || item.href === '/family-hub') && 
              userProfile?.role === 'professional'
            ) {
              return null;
            }
            return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )})}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 flex flex-col gap-4">
        <SidebarMenu>
          {bottomNavItems.map((item) => {
            if (item.role && item.role !== userProfile?.role) {
                return null;
            }
            return (
             <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            )
          })}
           <SidebarMenuItem>
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium">{user?.displayName ?? 'User'}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible={isMobile ? "offcanvas" : "icon"}>
        {sidebarContent}
      </Sidebar>
      <div className='flex-1 flex flex-col'>
         <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background/50 px-6 backdrop-blur-sm sticky top-0 z-30">
            <SidebarTrigger className="md:hidden">
              <PanelLeft />
            </SidebarTrigger>
            <div className='flex-1'>
            {/* Can add breadcrumbs or page title here */}
            </div>
            <Button asChild variant="ghost" size="icon">
                <Link href="/notifications">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Link>
            </Button>
            <Button asChild variant="ghost" size="icon">
                <Link href="/settings">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
            </Button>
        </header>
        <SidebarInset>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
