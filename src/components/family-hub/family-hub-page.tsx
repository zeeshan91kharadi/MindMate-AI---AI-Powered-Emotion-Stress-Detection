'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, Trash2, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useUser, useMemoFirebase, errorEmitter } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

type FamilyMember = {
  id: string;
  memberUid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  addedAt: Timestamp;
}

export function FamilyHubPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Detect whether the current user is email-verified.
  // Different wrappers put this flag in different places, so try a few common ones.
  const isEmailVerified = useMemo(() => {
    if (!user) return false;
    // common properties: user.emailVerified (firebase client), user.email_verified (token), user.token?.email_verified
    // adjust based on your useUser() shape if needed
    return (user as any).emailVerified === true
      || (user as any).email_verified === true
      || ((user as any).token && (user as any).token.email_verified === true);
  }, [user]);

  // Only create a familyMembersRef when we have firestore, a user, and the user is verified.
  const familyMembersRef = useMemoFirebase(() => {
    if (!user || !firestore || !isEmailVerified) return null;
    return collection(firestore, `users/${user.uid}/familyMembers`);
  }, [user, firestore, isEmailVerified]);

  // useCollection is only called with a non-null ref (so it won't attempt reads if unverified)
  const { data: familyMembers, isLoading: membersLoading } = useCollection<FamilyMember>(familyMembersRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) return;

    if (!isEmailVerified) {
      toast({
        variant: 'destructive',
        title: 'Verify your email',
        description: 'Please verify your email address before adding family members.',
      });
      return;
    }

    if (!familyMembersRef) {
      toast({
        variant: 'destructive',
        title: 'Not Ready',
        description: 'App is not ready to add family members. Please reload or verify your email.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', values.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Email account not found',
          description: 'No user exists with that email address.',
        });
        setIsLoading(false);
        return;
      }

      // Check if member is already added
      if (familyMembers?.some(member => member.email === values.email)) {
        toast({
          variant: 'destructive',
          title: 'Member Already Exists',
          description: 'This user is already in your Family Hub.',
        });
        setIsLoading(false);
        return;
      }

      const memberDoc = querySnapshot.docs[0];
      const memberData = memberDoc.data();

      const newFamilyMember = {
        memberUid: memberDoc.id,
        displayName: memberData.displayName,
        email: memberData.email,
        photoURL: memberData.photoURL || null,
        addedAt: serverTimestamp(),
      };

      await addDoc(familyMembersRef, newFamilyMember).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: familyMembersRef.path,
          operation: 'create',
          requestResourceData: newFamilyMember,
        }));
        // rethrow to hit outer catch and notify user
        throw error;
      });

      toast({
        title: 'Family Member Added',
        description: `${memberData.displayName} has been added to your Family Hub.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error adding family member:', error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Could not add family member. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!user || !firestore) return;
    if (!isEmailVerified) {
      toast({
        variant: 'destructive',
        title: 'Verify your email',
        description: 'Please verify your email address before removing family members.',
      });
      return;
    }
    const memberDocRef = doc(firestore, `users/${user.uid}/familyMembers`, memberId);
    await deleteDoc(memberDocRef).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: memberDocRef.path,
        operation: 'delete',
      }));
      console.error('Delete permission error:', error);
      toast({
        variant: 'destructive',
        title: 'Could not remove member',
        description: 'Permission denied or an error occurred.',
      });
    });
    toast({
      title: 'Member Removed',
      description: 'The family member has been removed from your hub.',
    });
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Add Family Member</CardTitle>
            <CardDescription>
              Add a family member by their email to send them stress alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEmailVerified ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your email address is not verified. For security and privacy we require a verified email to manage family members.
                </p>
                <p className="text-xs text-muted-foreground">
                  Please check your inbox for the verification email. If you didn't receive one, re-send it from your account settings.
                </p>
                <Button disabled className="w-full">Add Member (verify your email)</Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="family.member@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Add Member
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Your Family Hub</CardTitle>
            <CardDescription>
              These members will be notified if your weekly stress average is high.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isEmailVerified ? (
              <div className="text-center text-muted-foreground py-12 flex flex-col items-center gap-4">
                <UserX className="w-12 h-12"/>
                <p>Please verify your email to view and manage family members.</p>
                <p className="text-xs">Verification protects sensitive personal data in your Family Hub.</p>
              </div>
            ) : membersLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : familyMembers && familyMembers.length > 0 ? (
                familyMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 group">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={member.photoURL} />
                                <AvatarFallback>{member.displayName ? member.displayName.charAt(0) : '?'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{member.displayName}</p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove {member.displayName} from your Family Hub. They will no longer receive notifications.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteMember(member.id)} className={cn(buttonVariants({variant: "destructive"}))}>
                                        Remove
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ))
            ) : (
              <div className="text-center text-muted-foreground py-12 flex flex-col items-center gap-4">
                <UserX className="w-12 h-12"/>
                <p>Your Family Hub is empty.</p>
                <p className="text-xs">Add a family member using their email address to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
