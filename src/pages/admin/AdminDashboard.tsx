import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Users, FolderOpen, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  const statCards = [
    { title: 'Total Videos', value: stats?.totalVideos ?? 0, icon: Video, color: 'text-blue-500' },
    { title: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-green-500' },
    { title: 'Categories', value: stats?.totalCategories ?? 0, icon: FolderOpen, color: 'text-purple-500' },
    { title: 'Pending Review', value: stats?.pendingVideos ?? 0, icon: Clock, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin panel</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-8">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent activity to display</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Review pending videos in the Videos section
              </p>
              <p className="text-sm text-muted-foreground">
                • Manage categories and tags
              </p>
              <p className="text-sm text-muted-foreground">
                • Moderate user comments
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
