import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { User, Mail, Shield, Calendar, MapPin, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ResetPasswordForm } from './reset-password-form';

export default async function ProfilePage() {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const initials = (user.user_metadata?.full_name || user.email || 'U').slice(0, 2).toUpperCase();
    const role = user.user_metadata?.role || 'Employee';
    const roleLabel = role.replace('_', ' ');

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and profile information.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* User Stats/Summary Card */}
                <Card className="lg:col-span-1 border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                <AvatarImage src={user.user_metadata?.avatar_url} />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold">{user.user_metadata?.full_name || 'User'}</h2>
                                <Badge variant="secondary" className="capitalize">
                                    {roleLabel}
                                </Badge>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-foreground">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-foreground capitalize">{roleLabel}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Info Card */}
                <Card className="lg:col-span-2 border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            Your public profile information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <div className="p-2.5 rounded-md bg-muted/30 border border-border/50 text-sm">
                                    {user.user_metadata?.full_name || 'Not provided'}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                <div className="p-2.5 rounded-md bg-muted/30 border border-border/50 text-sm">
                                    {user.email}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                                <div className="p-2.5 rounded-md bg-muted/30 border border-border/50 text-sm">
                                    {user.id.slice(0, 8).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Contact Details</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span>Not provided</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>Not provided</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Change Password</h3>
                            <ResetPasswordForm />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
