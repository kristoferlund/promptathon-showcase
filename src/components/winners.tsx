import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { App } from "@/server";
import { WINNER_IDS, PODIUM } from "@/lib/constants";

function WinnerCardImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="overflow-hidden relative aspect-video rounded">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 border border-white/20 rounded ${loaded ? "opacity-100" : "opacity-0"}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function SkeletonWinnerCard({ index }: { index: number }) {
  const podium = PODIUM[index];
  return (
    <div className="w-75 overflow-hidden">
      <div className="relative">
        <div className="w-full aspect-video animate-pulse rounded bg-muted" />
        <div
          className={`absolute top-2 left-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${podium.bg} ${podium.border} ${podium.text} border`}
        >
          <span>{podium.emoji}</span>
          {podium.label}
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-3">
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default function Winners({
  apps,
  isLoading,
}: {
  apps: App[] | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="w-full max-w-316 mx-auto px-6">
        <div className="grid grid-cols-[repeat(auto-fill,300px)] gap-5 justify-center">
          {PODIUM.map((_, i) => (
            <SkeletonWinnerCard key={i} index={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!apps) return null;

  const winnerApps = WINNER_IDS.map((id) => apps.find((a) => Number(a.id) === id));

  if (winnerApps.some((a) => !a)) return null;

  return (
    <div className="w-full max-w-316 mx-auto px-6">
      <div className="grid grid-cols-[repeat(auto-fill,300px)] gap-5 justify-center">
        {winnerApps.map((app, i) => {
          if (!app) return null;
          const podium = PODIUM[i];

          return (
            <Link
              key={app.id}
              to="/app/$id"
              params={{ id: String(app.id) }}
              className="group block w-75 overflow-hidden transition-all"
            >
              <div className="relative">
                {app.image_id ? (
                  <WinnerCardImage
                    src={`/images/${app.image_id}_300.jpg`}
                    alt={app.title}
                  />
                ) : (
                  <div className="rounded bg-secondary flex items-center justify-center aspect-video">
                    <span className="text-muted-foreground text-xs">
                      No preview
                    </span>
                  </div>
                )}
                <div
                  className={`absolute top-2 left-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${podium.bg} ${podium.border} ${podium.text} border`}
                >
                  <span>{podium.emoji}</span>
                  {podium.label}
                </div>
              </div>
              <div className="py-3 px-0.5">
                <div className="font-medium text-foreground line-clamp-2">
                  {app.title || app.app_name}
                </div>
                {app.author_name && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {app.author_name}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
