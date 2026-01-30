// @ts-ignore: Deno types
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  console.log("og-image function invoked:", req.method, req.url);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get("id");
    const siteParam = url.searchParams.get("site");

    console.log("Video ID:", videoId, "Site:", siteParam);

    if (!videoId) {
      return new Response("Video ID required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    console.log("Creating Supabase client with URL:", supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: video, error } = await supabase
      .from("videos")
      .select("title, description, thumbnail_url")
      .eq("id", videoId)
      .single();

    if (error || !video) {
      console.error("Video not found:", error);
      return new Response("Video not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    console.log("Video found:", video.title, "Thumbnail:", video.thumbnail_url);

    // Escape HTML entities
    const escapeHtml = (str: string): string => {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    // Determine site URL
    const defaultSiteUrl = "https://vidhubleaks.lovable.app";
    let siteUrl = defaultSiteUrl;
    if (siteParam) {
      try {
        const parsed = new URL(siteParam);
        siteUrl = `${parsed.protocol}//${parsed.host}`;
      } catch {
        console.log("Invalid site param, using default");
      }
    }

    // Build absolute thumbnail URL
    let thumbnailUrl = video.thumbnail_url || "";
    if (thumbnailUrl && !thumbnailUrl.startsWith("http")) {
      thumbnailUrl = `${supabaseUrl}${thumbnailUrl.startsWith("/") ? "" : "/"}${thumbnailUrl}`;
    }

    // Prepare meta content
    const siteName = "Vid Hub";
    const title = escapeHtml(video.title || "Vid Hub Video");
    const description = escapeHtml(
      video.description?.substring(0, 200) || "Watch this video on Vid Hub"
    );
    const videoUrl = `${siteUrl}/video/${videoId}`;
    const ogImageType = thumbnailUrl.includes(".png") ? "image/png" : "image/jpeg";

    // Get domain for Twitter
    let twitterDomain = "vidhubleaks.lovable.app";
    try {
      twitterDomain = new URL(siteUrl).hostname;
    } catch {
      // Use default
    }

    console.log("Generated thumbnail URL:", thumbnailUrl);
    console.log("Video page URL:", videoUrl);

    // Generate HTML with meta tags for crawlers
    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Basic Meta -->
  <title>${title} - ${siteName}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${videoUrl}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="video.other">
  <meta property="og:title" content="${title}">
  <meta property="og:url" content="${videoUrl}">
  <meta property="og:description" content="${description}">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:image" content="${thumbnailUrl}">
  <meta property="og:image:secure_url" content="${thumbnailUrl}">
  <meta property="og:image:type" content="${ogImageType}">
  <meta property="og:image:width" content="1280">
  <meta property="og:image:height" content="720">
  <meta property="og:image:alt" content="${title}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@TweetPrince12">
  <meta name="twitter:creator" content="@TweetPrince12">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${thumbnailUrl}">
  <meta name="twitter:image:src" content="${thumbnailUrl}">
  <meta name="twitter:image:alt" content="${title}">
  <meta name="twitter:domain" content="${twitterDomain}">
  <meta name="twitter:url" content="${videoUrl}">
  
  <!-- Redirect to actual video page -->
  <meta http-equiv="refresh" content="0;url=${videoUrl}">
</head>
<body style="font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #0a0a0a; color: #fff;">
  <div style="text-align: center;">
    <h1>${title}</h1>
    <p>Redirecting to <a href="${videoUrl}" style="color: #8B5CF6;">Vid Hub</a>...</p>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Error in og-image function:", err);
    return new Response(`Internal error: ${err}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
