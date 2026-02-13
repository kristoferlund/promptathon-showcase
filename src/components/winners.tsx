import { Link } from "@tanstack/react-router";
import type { App } from "@/server";
import { R2_PUBLIC_URL, WINNER_IDS, PODIUM } from "@/lib/constants";

export default function Winners({
  apps,
}: {
  apps: App[] | undefined;
}) {
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
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-t text-xs font-semibold ${podium.bg} ${podium.border} ${podium.text} border`}
              >
                <span className="text-sm">{podium.emoji}</span>
                {podium.label}
              </div>
              {app.image_id ? (
                <div className="overflow-hidden">
                  <img
                    src={`${R2_PUBLIC_URL}/${app.image_id}_300.jpg`}
                    alt={app.title}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 border border-white/20 rounded-b`}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="rounded-b bg-secondary flex items-center justify-center h-42">
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
          );
        })}
      </div>
    </div>
  );
}
