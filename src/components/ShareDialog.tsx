import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, Twitter, Facebook, Linkedin, Mail, MessageCircle } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
  title: string;
}

export function ShareDialog({ open, onOpenChange, videoId, title }: ShareDialogProps) {
  // Direct URL to the video page
  const directUrl = `${window.location.origin}/video/${videoId}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedDirectUrl = encodeURIComponent(directUrl);

  const socialPlatforms = [
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-black hover:bg-black/80',
      // Share direct video URL - meta tags are handled by react-helmet-async
      url: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedDirectUrl}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-[#1877F2] hover:bg-[#1877F2]/80',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedDirectUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2] hover:bg-[#0A66C2]/80',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedDirectUrl}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366] hover:bg-[#25D366]/80',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedDirectUrl}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-muted hover:bg-muted/80',
      url: `mailto:?subject=${encodedTitle}&body=Check out this video: ${encodedDirectUrl}`,
    },
  ];

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onOpenChange(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Video</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-5 gap-3 py-4">
          {socialPlatforms.map((platform) => (
            <button
              key={platform.name}
              onClick={() => handleShare(platform.url)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg ${platform.color} text-white transition-all hover:scale-105`}
              title={platform.name}
            >
              <platform.icon className="h-6 w-6" />
              <span className="text-xs mt-1 truncate w-full text-center">{platform.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={directUrl}
            readOnly
            className="flex-1 text-sm"
          />
          <Button onClick={handleCopyLink} variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
