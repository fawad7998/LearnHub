import { useEffect, useRef, useState } from "react";
import { ExternalLink, Video } from "lucide-react";
import { Loading } from "./Shared";

function getVideoId(value) {
  try {
    const url = new URL(value);
    if (
      ![
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "www.youtube-nocookie.com",
      ].includes(url.hostname)
    )
      return null;
    const id =
      url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.searchParams.get("v") ||
          url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)$/)?.[1];
    return /^[\w-]{11}$/.test(id || "") ? id : null;
  } catch {
    return null;
  }
}

export default function VideoPlayer({ url, title, creator }) {
  const id = getVideoId(url);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    setLoading(true);
    setSlow(false);
    timer.current = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(timer.current);
  }, [id]);
  if (!id) return null;
  return (
    <section className="video-player" aria-label="Lesson video">
      <div className="video-frame">
        <iframe
          key={id}
          title={title}
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => {
            setLoading(false);
            clearTimeout(timer.current);
          }}
        />
      </div>
    </section>
  );
}
