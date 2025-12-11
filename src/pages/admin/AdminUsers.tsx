import { useState } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAdminUsers } from '@/hooks/useAdminStats';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, Shield, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';

const roleColors: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-500',
  moderator: 'bg-blue-500/20 text-blue-500',
  user: 'bg-green-500/20 text-green-500',
};

const roleIcons: Record<string, React.ElementType> = {
  admin: ShieldCheck,
  moderator: Shield,
  user: User,
};

export default function AdminUsers() {
  const { data: users, isLoading } = useAdminUsers();
  const queryClient = useQueryClient();

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      // First delete existing role
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Then insert new role
      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: newRole,
      });

      if (error) throw error;
      
      toast.success(`Role updated to ${newRole}`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage users and their roles</p>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users?.map((user) => {
                  const role = (user.user_roles as any)?.[0]?.role ?? 'user';
                  const RoleIcon = roleIcons[role] || User;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url ?? undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {user.display_name?.charAt(0).toUpperCase() ?? user.username?.charAt(0).toUpperCase() ?? 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.display_name ?? 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        @{user.username ?? '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${roleColors[role]} gap-1`}>
                          <RoleIcon className="h-3 w-3" />
                          {role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.user_id, 'admin')}
                              disabled={role === 'admin'}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.user_id, 'moderator')}
                              disabled={role === 'moderator'}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Make Moderator
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.user_id, 'user')}
                              disabled={role === 'user'}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Make User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
