import { useEffect, useRef } from "react";

interface TwitterWidgets {
  widgets: {
    createTweet: (id: string, el: HTMLElement, opts: Record<string, unknown>) => void;
  };
}

interface TikTokEmbed {
  lib: { render: () => void };
}

declare global {
  interface Window {
    twttr?: TwitterWidgets;
    tiktokEmbed?: TikTokEmbed;
  }
}

type Platform = "x" | "tiktok" | "other";

function detectPlatform(url: string): Platform {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (hostname === "x.com" || hostname === "twitter.com") return "x";
    if (hostname === "tiktok.com" || hostname === "vt.tiktok.com") return "tiktok";
    return "other";
  } catch {
    return "other";
  }
}

function extractTweetId(url: string): string | null {
  const match = /\/status\/(\d+)/.exec(url);
  return match ? match[1] : null;
}

function extractTikTokVideoId(url: string): string | null {
  const match = /\/video\/(\d+)/.exec(url);
  return match ? match[1] : null;
}

function waitForTwitter(): Promise<TwitterWidgets> {
  return new Promise((resolve) => {
    // If already available, resolve immediately
    if (window.twttr?.widgets) {
      resolve(window.twttr);
      return;
    }

    // Inject script if not present
    if (!document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
      const s = document.createElement("script");
      s.src = "https://platform.twitter.com/widgets.js";
      s.async = true;
      document.body.appendChild(s);
    }

    // Poll until twttr.widgets is available
    const interval = setInterval(() => {
      if (window.twttr?.widgets) {
        clearInterval(interval);
        resolve(window.twttr);
      }
    }, 100);
  });
}

function XEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tweetId = extractTweetId(url);
    if (!tweetId || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    let cancelled = false;

    void waitForTwitter().then((twttr) => {
      if (cancelled) return;
      container.innerHTML = "";
      twttr.widgets.createTweet(tweetId, container, { theme: "dark", conversation: "none", width: 550 });
    });

    return () => {
      cancelled = true;
      container.innerHTML = "";
    };
  }, [url]);

  return <div ref={containerRef} className="w-full max-w-full overflow-hidden [&_iframe]:!max-w-full [&_.twitter-tweet]:mx-auto" />;
}

function TikTokEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoId = extractTikTokVideoId(url);

  useEffect(() => {
    if (!containerRef.current) return;

    const existing = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://www.tiktok.com/embed.js";
      s.async = true;
      document.body.appendChild(s);
    } else {
      // Re-process embeds if script already loaded
      window.tiktokEmbed?.lib.render();
    }
  }, [url]);

  if (!videoId) {
    return <SocialLink url={url} />;
  }

  return (
    <div ref={containerRef} className="max-w-lg">
      <blockquote
        className="tiktok-embed"
        cite={url}
        data-video-id={videoId}
        style={{ maxWidth: "605px", minWidth: "325px" }}
      >
        <section>
          <a target="_blank" rel="noreferrer" href={url}>
            View on TikTok
          </a>
        </section>
      </blockquote>
    </div>
  );
}

function SocialLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="underline text-primary hover:text-primary/80 transition-colors text-sm break-all"
    >
      {url}
    </a>
  );
}

export default function SocialEmbed({ url }: { url: string }) {
  const platform = detectPlatform(url);

  switch (platform) {
    case "x":
      return <XEmbed url={url} />;
    case "tiktok":
      return <TikTokEmbed url={url} />;
    default:
      return <SocialLink url={url} />;
  }
}
