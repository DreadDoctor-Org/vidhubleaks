import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  console.log("share-meta function called");
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get("id");
    const site = url.searchParams.get("site") || "https://vidhubleaks.lovable.app";

    if (!videoId) {
      return new Response("Missing video ID", { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: video, error } = await supabase
      .from("videos")
      .select("title, description, thumbnail_url")
      .eq("id", videoId)
      .single();

    if (error || !video) {
      console.error("Video not found:", error);
      return new Response("Video not found", { status: 404, headers: corsHeaders });
    }

    // Escape HTML
    const esc = (s: string) => s?.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;") || "";

    // Parse site URL
    let siteUrl = "https://vidhubleaks.lovable.app";
    try { siteUrl = new URL(site).origin; } catch {}

    // Build absolute thumbnail
    let thumb = video.thumbnail_url || "";
    if (thumb && !thumb.startsWith("http")) {
      thumb = `${supabaseUrl}${thumb.startsWith("/") ? "" : "/"}${thumb}`;
    }

    const title = esc(video.title || "Vid Hub Video");
    const desc = esc(video.description?.slice(0, 200) || "Watch on Vid Hub");
    const videoUrl = `${siteUrl}/video/${videoId}`;
    const domain = new URL(siteUrl).hostname;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="video.other">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${videoUrl}">
<meta property="og:image" content="${thumb}">
<meta property="og:image:width" content="1280">
<meta property="og:image:height" content="720">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${thumb}">
<meta name="twitter:domain" content="${domain}">
<meta http-equiv="refresh" content="0;url=${videoUrl}">
</head>
<body style="background:#0a0a0a;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:system-ui">
<div style="text-align:center">
<h1>${title}</h1>
<p>Redirecting to <a href="${videoUrl}" style="color:#8B5CF6">Vid Hub</a>...</p>
</div>
</body>
</html>`;

    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
});
