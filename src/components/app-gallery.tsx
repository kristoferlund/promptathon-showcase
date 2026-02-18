import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { App } from "@/types";
import { WINNER_IDS } from "@/lib/constants";

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function SkeletonCard() {
  return (
    <div className="w-75 overflow-hidden">
      <div className="w-full aspect-video animate-pulse rounded bg-muted" />
      <div className="flex flex-col gap-2 pt-3">
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function CardImage({ src, alt }: { src: string; alt: string }) {
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

export default function AppGallery({
  apps,
  isLoading,
}: {
  apps: App[] | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="w-full max-w-316 mx-auto px-6 pb-16">
        <div className="grid grid-cols-[repeat(auto-fill,300px)] gap-5 justify-center">
          {Array.from({ length: 9 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const shuffledApps = useMemo(() => {
    if (!apps) return [];
    const winnerIdSet = new Set(WINNER_IDS);
    return shuffle(apps.filter((app) => !winnerIdSet.has(app.id)));
  }, [apps]);

  if (!apps || apps.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-316 mx-auto px-6 pb-16">
      <div className="grid grid-cols-[repeat(auto-fill,300px)] gap-5 justify-center">
        {shuffledApps.map((app) => (
          <Link
            key={app.id}
            to="/app/$id"
            params={{ id: String(app.id) }}
            className="group block w-75 overflow-hidden transition-all"
          >
            {app.image_id ? (
              <CardImage
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
            <div className="flex flex-col gap-1 pt-3">
              <div className="font-medium text-foreground line-clamp-2">
                {app.title || app.app_name}
              </div>
              {app.author_name && (
                <div className="text-xs text-muted-foreground pt-1">
                  {app.author_name}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
