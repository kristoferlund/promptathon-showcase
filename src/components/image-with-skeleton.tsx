import { useState } from "react";

export default function ImageWithSkeleton({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="w-full rounded-xl my-8 overflow-hidden bg-card">
      {!loaded && (
        <div className="w-full aspect-video animate-pulse rounded-xl bg-muted" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-auto ${loaded ? "" : "hidden"}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
