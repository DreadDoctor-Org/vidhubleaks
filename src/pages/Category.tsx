import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { VideoGrid } from '@/components/videos/VideoGrid';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { BannerAd728 } from '@/components/ads';

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories } = useCategories();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const category = categories?.find((c) => c.slug === slug);

  useEffect(() => {
    if (category) {
      fetchVideos();
    }
  }, [category]);

  const fetchVideos = async () => {
    if (!category) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        profiles!videos_user_id_profiles_fkey (username, display_name, avatar_url),
        categories (name, slug)
      `)
      .eq('status', 'published')
      .eq('category_id', category.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setVideos(data || []);
    }
    setLoading(false);
  };

  if (!category && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <BannerAd728 />
        <main className="container px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The category you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </main>
        <BannerAd728 />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Top Banner Ad */}
      <BannerAd728 />
      
      <main className="container px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4 gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <div className="flex items-center gap-4">
            {category?.thumbnail_url && (
              <img 
                src={category.thumbnail_url} 
                alt={category?.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">{category?.name}</h1>
              {category?.description && (
                <p className="text-muted-foreground mt-2">{category.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Other categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories?.filter((c) => c.is_active && c.slug !== slug).slice(0, 8).map((cat) => (
            <Link key={cat.id} to={`/category/${cat.slug}`}>
              <Badge variant="secondary" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>

        <p className="text-muted-foreground mb-4">
          {videos.length} video{videos.length !== 1 ? 's' : ''} in this category
        </p>

        <VideoGrid videos={videos} isLoading={loading} />
      </main>

      {/* Bottom Banner Ad */}
      <BannerAd728 />
    </div>
  );
}
