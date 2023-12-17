"use client";

export function YoutubeEmbed({ url }: { url: string }) {
  // https://www.youtube.com/shorts/zO2ddEBYWh8 -> zO2ddEBYWh8
  // https://www.youtube.com/watch?v=O-IybyB5YwE -> O-IybyB5YwE
  const lastPart = url.split("/").pop();
  if (lastPart?.startsWith("shorts")) {
    const videoId = lastPart.split("/").pop();
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return (
      <div className="w-full">
        <iframe
          className=""
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          frameBorder={0}
          allowFullScreen
        />
      </div>
    );
  }

  const videoId = lastPart?.split("=").pop();
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="w-full">
      <iframe
        className=""
        src={embedUrl}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        frameBorder={0}
        allowFullScreen
      />
    </div>
  );
}
