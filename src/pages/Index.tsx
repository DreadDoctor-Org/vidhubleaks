import { Header } from '@/components/layout/Header';
import { VideoGrid } from '@/components/videos/VideoGrid';
import { useVideos } from '@/hooks/useVideos';
import { useCategories } from '@/hooks/useCategories';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { BannerAd728, BannerAd320, NativeBannerAd } from '@/components/ads';

export default function Index() {
  const { data: videos, isLoading } = useVideos('published');
  const { data: categories } = useCategories();

  // Split videos for ad insertion
  const videosArray = videos || [];
  const firstBatch = videosArray.slice(0, 4);
  const secondBatch = videosArray.slice(4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Top 728x90 Banner Ad */}
      <BannerAd728 />
      
      <main className="container px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to <span className="text-gradient">VidHub</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover and share amazing videos from creators around the world
          </p>
        </section>

        {categories && categories.length > 0 && (
          <section className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.filter(c => c.is_active).slice(0, 10).map((category) => (
                <Link key={category.id} to={`/category/${category.slug}`}>
                  <Badge variant="secondary" className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Latest Videos</h2>
          
          {/* First batch of videos */}
          <VideoGrid videos={firstBatch} isLoading={isLoading} />
          
          {/* In-feed 320x50 Ad */}
          {videosArray.length > 4 && (
            <div className="my-6">
              <BannerAd320 />
            </div>
          )}
          
          {/* Second batch of videos */}
          {secondBatch.length > 0 && (
            <VideoGrid videos={secondBatch} isLoading={false} />
          )}
        </section>
      </main>

      {/* Bottom Native Banner Ad */}
      <NativeBannerAd />
      
      {/* Bottom 728x90 Banner Ad */}
      <BannerAd728 />
      
      {/* Bottom Native Banner Ad */}
      <NativeBannerAd />
    </div>
  );
}
