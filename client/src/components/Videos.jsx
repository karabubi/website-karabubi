import { useLanguage } from "../context/LanguageContext";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

function getVideoUrl(videoUrl) {
  if (!videoUrl) {
    return "";
  }

  if (
    videoUrl.startsWith("http://") ||
    videoUrl.startsWith("https://")
  ) {
    return videoUrl;
  }

  return `${API_URL}${videoUrl}`;
}

function formatVideoSize(bytes) {
  const size =
    Number(bytes || 0);

  if (!Number.isFinite(size)) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function getLocalizedTitle(
  video,
  language
) {
  if (language === "de") {
    return (
      video.titleDe ||
      video.titleEn ||
      video.title ||
      ""
    );
  }

  if (language === "ar") {
    return (
      video.titleAr ||
      video.titleEn ||
      video.title ||
      ""
    );
  }

  return (
    video.titleEn ||
    video.title ||
    ""
  );
}

function getLocalizedDescription(
  video,
  language
) {
  if (language === "de") {
    return (
      video.descriptionDe ||
      video.descriptionEn ||
      video.description ||
      ""
    );
  }

  if (language === "ar") {
    return (
      video.descriptionAr ||
      video.descriptionEn ||
      video.description ||
      ""
    );
  }

  return (
    video.descriptionEn ||
    video.description ||
    ""
  );
}

function Videos() {
  const {
    t,
    language,
  } = useLanguage();
  const [videos, setVideos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadVideos =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/videos`,
            {
              credentials:
                "include",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              t.videosPage.loadError
          );
        }

        setVideos(
          data.videos || []
        );
      } catch (requestError) {
        setVideos([]);

        setError(
          requestError.message ||
            t.videosPage.loadError
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  return (
    <main className="min-h-[calc(100vh-86px)] bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-10 text-center">
          <div className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold tracking-wide text-cyan-300">{t.videosPage.badge}</div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{t.videosPage.title}</h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            {t.videosPage.intro}
          </p>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center text-slate-300">
            {t.videosPage.loading}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <p className="text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={loadVideos}
              className="mt-5 rounded-xl bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Try Again
            </button>
          </div>
        ) : videos.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center">
            <div className="text-5xl">
              🎬
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No videos yet
            </h2>

            <p className="mt-2 text-slate-400">
              New videos will appear
              here after they are
              uploaded.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {videos.map(
              (video) => (
                <article
                  key={video.id}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/20"
                >
                  <div className="bg-black">
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      className="aspect-video w-full bg-black object-contain"
                    >
                      <source
                        src={getVideoUrl(
                          video.videoUrl
                        )}
                        type={
                          video.videoMimeType ||
                          undefined
                        }
                      />

                      Your browser does
                      not support the
                      video element.
                    </video>
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-bold text-white">
                      {getLocalizedTitle(video, language)}
                    </h2>

                    {getLocalizedDescription(video, language) && (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                        {getLocalizedDescription(video, language)}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-500">
                      {video.videoSize !=
                        null && (
                        <span>
                          {formatVideoSize(
                            video.videoSize
                          )}
                        </span>
                      )}

                      {video.createdAt && (
                        <span>
                          {new Date(
                            video.createdAt
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default Videos;
