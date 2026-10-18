import { AppError } from "../middleware/errors.js";

function youtubeUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be",
      "www.youtube-nocookie.com",
    ].includes(url.hostname)
      ? url
      : null;
  } catch {
    return null;
  }
}

export function videoId(value) {
  const url = youtubeUrl(value);
  if (!url) return null;
  const id =
    url.hostname === "youtu.be"
      ? url.pathname.slice(1)
      : url.searchParams.get("v") ||
        url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)$/)?.[1];
  return /^[\w-]{11}$/.test(id || "") ? id : null;
}

export function playlistId(value) {
  const id = youtubeUrl(value)?.searchParams.get("list");
  return /^[\w-]{10,100}$/.test(id || "") ? id : null;
}

export async function readPlaylist(value) {
  const id = playlistId(value);
  if (!id) throw new AppError(400, "Enter a valid YouTube playlist link.");
  if (!process.env.YOUTUBE_API_KEY)
    throw new AppError(
      503,
      "Automatic playlist import needs YOUTUBE_API_KEY in the backend environment. You can add individual video links without it.",
    );
  const lessons = [];
  let pageToken = "";
  let pages = 0;
  let skipped = 0;
  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.search = new URLSearchParams({
      part: "snippet,contentDetails,status",
      playlistId: id,
      maxResults: "50",
      key: process.env.YOUTUBE_API_KEY,
      ...(pageToken ? { pageToken } : {}),
    });
    let response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    } catch {
      throw new AppError(
        502,
        "YouTube could not be reached. Try again shortly.",
      );
    }
    const data = await response.json();
    if (!response.ok)
      throw new AppError(
        response.status === 404 ? 404 : 502,
        "YouTube could not read this playlist. Check that it is public and that the API key has YouTube Data API v3 enabled and available quota.",
      );
    for (const item of data.items || []) {
      const snippet = item.snippet;
      const id = item.contentDetails?.videoId;
      if (
        !id ||
        !snippet ||
        item.status?.privacyStatus === "private" ||
        ["Private video", "Deleted video"].includes(snippet.title)
      ) {
        skipped++;
        continue;
      }
      lessons.push({
        title: snippet.title.slice(0, 180),
        videoUrl: `https://www.youtube.com/watch?v=${id}`,
        sourceAuthor: (
          snippet.videoOwnerChannelTitle ||
          snippet.channelTitle ||
          "YouTube creator"
        ).slice(0, 120),
      });
    }
    pageToken = data.nextPageToken || "";
    pages++;
    if (pageToken && pages >= 20)
      throw new AppError(
        400,
        "This playlist is too large. Import a playlist with no more than 1,000 videos.",
      );
  } while (pageToken);
  if (!lessons.length)
    throw new AppError(400, "This playlist has no available public videos.");
  return { lessons, skipped };
}
