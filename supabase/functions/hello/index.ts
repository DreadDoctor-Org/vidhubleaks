import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Bot/crawler user agents that need meta tags without redirect
const BOT_AGENTS = [
  "twitterbot",
  "facebookexternalhit",
  "linkedinbot",
  "slackbot",
  "discordbot",
  "telegrambot",
  "whatsapp",
  "googlebot",
  "bingbot",
  "yandexbot",
  "baiduspider",
  "duckduckbot",
  "ia_archiver",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "pinterest",
  "applebot",
  "crawler",
  "spider",
  "bot",
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some((bot) => ua.includes(bot));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const videoId = url.searchParams.get("id");
    const site =
      url.searchParams.get("site") || "https://vidhubleaks.lovable.app";
    const userAgent = req.headers.get("user-agent") || "";

    if (!videoId) {
      return new Response("Missing video ID", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // For non-bot users, redirect immediately to the video page
    let siteUrl = "https://vidhubleaks.lovable.app";
    try {
      siteUrl = new URL(site).origin;
    } catch {
      // use default
    }
    const videoUrl = `${siteUrl}/video/${videoId}`;

    if (!isBot(userAgent)) {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: videoUrl,
        },
      });
    }

    // For bots/crawlers: fetch video data and serve meta tags
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: video, error } = await supabase
      .from("videos")
      .select("title, description, thumbnail_url")
      .eq("id", videoId)
      .eq("status", "published")
      .single();

    if (error || !video) {
      return new Response("Video not found", {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const esc = (s: string) =>
      s
        ?.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;") || "";

    // Ensure thumbnail is an absolute HTTPS URL
    let thumb = video.thumbnail_url || "";
    if (thumb && !thumb.startsWith("http")) {
      thumb = `${supabaseUrl}/storage/v1/object/public/${thumb.startsWith("/") ? thumb.slice(1) : thumb}`;
    }

    // If thumbnail is hosted on an external domain (not our Supabase storage),
    // route it through our proxy so social crawlers (Twitter/X, Facebook, etc.)
    // can fetch it without being blocked by hotlink/bot protection.
    if (thumb) {
      try {
        const tu = new URL(thumb);
        const supaHost = new URL(supabaseUrl).host;
        if (tu.host !== supaHost) {
          thumb = `${supabaseUrl}/functions/v1/thumb?url=${encodeURIComponent(thumb)}`;
        }
      } catch {
        // leave thumb as-is
      }
    }

    const title = esc(video.title || "Vid Hub Video");
    const desc = esc(
      video.description?.slice(0, 200) || "Watch this video on Vid Hub"
    );
    const domain = new URL(siteUrl).hostname;

    // For bots: serve ONLY meta tags, NO redirect, NO meta-refresh
    // This ensures crawlers can read the tags without being redirected away
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title} - Vid Hub</title>
<meta name="title" content="${title}">
<meta name="description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Vid Hub">
<meta property="og:url" content="${videoUrl}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${thumb}">
<meta property="og:image:alt" content="${title}">
<meta property="og:image:width" content="1280">
<meta property="og:image:height" content="720">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${thumb}">
<meta name="twitter:image:alt" content="${title}">
<meta name="twitter:url" content="${videoUrl}">
<meta name="twitter:domain" content="${domain}">
<link rel="canonical" href="${videoUrl}">
</head>
<body>
<h1>${title}</h1>
<p>${desc}</p>
<p><a href="${videoUrl}">Watch on Vid Hub</a></p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("hello function error:", e);
    return new Response("Internal error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
