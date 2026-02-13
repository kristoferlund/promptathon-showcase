import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { App } from "@/server";
import { R2_PUBLIC_URL, WINNER_IDS } from "@/lib/constants";

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
      <div className="w-full px-6 mt-12 pb-16">
        <div className="text-center text-muted-foreground text-sm">
          Loading apps...
        </div>
      </div>
    );
  }

  const shuffledApps = useMemo(() => {
    if (!apps) return [];
    const winnerIdSet = new Set(WINNER_IDS);
    return shuffle(apps.filter((app) => !winnerIdSet.has(Number(app.id))));
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
              <div className="overflow-hidden">
                <img
                  src={`${R2_PUBLIC_URL}/${app.image_id}_300.jpg`}
                  alt={app.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 border border-white/20 rounded"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="rounded-lg bg-secondary flex items-center justify-center">
                <span className="text-muted-foreground text-xs">
                  No preview
                </span>
              </div>
            )}
            <div className="py-2 px-0.5">
              <div className="font-medium text-foreground leading-tight line-clamp-1">
                {app.app_name || app.title}
              </div>
              {app.author_name && (
                <div className="text-xs text-muted-foreground/50 leading-tight mt-0.5">
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
