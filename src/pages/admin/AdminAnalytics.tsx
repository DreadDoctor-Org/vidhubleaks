import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart, MessageSquare, TrendingUp, Video, Users, Clock, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['hsl(142, 76%, 36%)', 'hsl(48, 96%, 53%)', 'hsl(217, 91%, 60%)', 'hsl(0, 84%, 60%)', 'hsl(262, 83%, 58%)'];

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useAnalytics();

  const overviewCards = [
    { title: 'Total Views', value: analytics?.totalViews ?? 0, icon: Eye, color: 'text-blue-500' },
    { title: 'Total Likes', value: analytics?.totalLikes ?? 0, icon: Heart, color: 'text-red-500' },
    { title: 'Total Comments', value: analytics?.totalComments ?? 0, icon: MessageSquare, color: 'text-green-500' },
    { title: 'Total Videos', value: analytics?.totalVideos ?? 0, icon: Video, color: 'text-purple-500' },
    { title: 'Total Users', value: analytics?.totalUsers ?? 0, icon: Users, color: 'text-orange-500' },
    { title: 'Published', value: analytics?.publishedVideos ?? 0, icon: TrendingUp, color: 'text-emerald-500' },
    { title: 'Pending Review', value: analytics?.pendingVideos ?? 0, icon: Clock, color: 'text-yellow-500' },
    {
      title: 'Engagement Rate',
      value: analytics?.totalViews
        ? (((analytics.totalLikes + analytics.totalComments) / analytics.totalViews) * 100).toFixed(1) + '%'
        : '0%',
      icon: TrendingUp,
      color: 'text-pink-500',
    },
  ];

  const todayCards = [
    { title: "Today's Views", value: analytics?.todayViews ?? 0, icon: Eye, color: 'text-blue-400' },
    { title: "Today's Likes", value: analytics?.todayLikes ?? 0, icon: Heart, color: 'text-red-400' },
    { title: "Today's Comments", value: analytics?.todayComments ?? 0, icon: MessageSquare, color: 'text-green-400' },
    { title: "Today's Signups", value: analytics?.todaySignups ?? 0, icon: Users, color: 'text-orange-400' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Live platform performance — auto-refreshes every 30s</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3 w-3 animate-pulse text-green-500" />
            Live
          </div>
        </div>

        {/* Today's Stats */}
        <h2 className="text-lg font-semibold mb-3">Today</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {todayCards.map((stat) => (
            <Card key={stat.title} className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All-Time Overview */}
        <h2 className="text-lg font-semibold mb-3">All-Time</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {overviewCards.map((stat) => (
            <Card key={stat.title} className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          {/* Daily Activity Line Chart */}
          <Card className="border-border bg-card md:col-span-2">
            <CardHeader>
              <CardTitle>Daily Activity (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={analytics?.dailyChart || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => { const d = new Date(v); return `${d.getMonth()+1}/${d.getDate()}`; }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="views" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={false} name="Views" />
                    <Line type="monotone" dataKey="likes" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} name="Likes" />
                    <Line type="monotone" dataKey="signups" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={false} name="Signups" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Videos by Status Pie Chart */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Videos by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics?.videosByStatus || []}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {analytics?.videosByStatus?.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top Videos by Views */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Top Videos by Views</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analytics?.topVideos?.map((video, index) => (
                    <div key={video.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                        <span className="font-medium truncate max-w-[180px]">{video.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{video.views_count?.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{video.likes_count?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Liked Videos */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Top Videos by Likes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {analytics?.topLikedVideos?.map((video, index) => (
                    <div key={video.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                        <span className="font-medium truncate max-w-[180px]">{video.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{video.likes_count?.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{video.views_count?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Video</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.recentActivity?.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium truncate max-w-[300px]">{activity.title}</TableCell>
                      <TableCell>{(activity.profiles as any)?.display_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          activity.status === 'published' ? 'bg-green-500/20 text-green-500' :
                          activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {activity.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(activity.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
