import { Link } from "@tanstack/react-router";
import type { App } from "@/server";
import { R2_PUBLIC_URL, getWinnerBadge } from "@/lib/constants";
import ImageWithSkeleton from "@/components/image-with-skeleton";
import ArrowLeftIcon from "@/components/icons/arrow-left";
import SocialEmbed from "@/components/social-embed";

export default function AppDetail({
  app,
}: {
  app: App;
}) {
  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <div className="mb-12">
        <Link
          to="/"
          className="hover:text-primary/80 no-underline text-sm inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Back
        </Link>
      </div>

      <article>
        {(() => {
          const badge = getWinnerBadge(Number(app.id));
          return badge ? (
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${badge.bg} ${badge.border} ${badge.text} border mb-4`}
            >
              <span>{badge.emoji}</span>
              {badge.label}
            </div>
          ) : null;
        })()}
        <h1 className="text-4xl font-bold text-foreground my-4 leading-tight">
          {app.app_name}
        </h1>

        {app.image_id && (
          <ImageWithSkeleton
            src={`${R2_PUBLIC_URL}/${app.image_id}_1500.jpg`}
            alt={app.title}
          />
        )}

        <div className="text-lg my-6 leading-relaxed">
          {app.description}
        </div>

        <table className="w-full text-sm mt-12 pt-8 border-t border-border">
          <tbody>
            {app.author_name && (
              <tr className="border-b border-border">
                <td className="py-3 pr-6 text-muted-foreground whitespace-nowrap">Author</td>
                <td className="py-3">{app.author_name}</td>
              </tr>
            )}
            {app.url && (
              <tr className="border-b border-border">
                <td className="py-3 pr-6 text-muted-foreground whitespace-nowrap">App URL</td>
                <td className="py-3">
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-primary hover:text-primary/80 transition-colors"
                  >
                    {app.url}
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {app.social_post_url && (
          <div className="mt-12 flex flex-col items-center bg-card/50 p-5 rounded-xl">
            <div className="text-sm text-muted-foreground mb-4 font-medium">Announcement</div>
            <SocialEmbed url={app.social_post_url} />
          </div>
        )}
      </article>
    </div>
  );
}
