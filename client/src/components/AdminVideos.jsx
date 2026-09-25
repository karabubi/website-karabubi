import { useLanguage } from "../context/LanguageContext";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

const TOKEN_KEY =
  "websiteKarabubiToken";

const MAX_VIDEO_SIZE =
  200 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
];

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

async function videoRequest(
  path = "",
  options = {}
) {
  const token =
    localStorage.getItem(
      TOKEN_KEY
    );

  const isFormData =
    typeof FormData !==
      "undefined" &&
    options.body instanceof
      FormData;

  const response =
    await fetch(
      `${API_URL}/videos${path}`,
      {
        ...options,

        credentials:
          "include",

        headers: {
          ...(
            !isFormData
              ? {
                  "Content-Type":
                    "application/json",
                }
              : {}
          ),

          ...(
            token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}
          ),

          ...(
            options.headers ||
            {}
          ),
        },
      }
    );

  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Video request failed."
    );
  }

  return data;
}

function AdminVideos() {
  const { t } = useLanguage();
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [videos, setVideos] =
    useState([]);

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    titleDe,
    setTitleDe,
  ] = useState("");

  const [
    titleAr,
    setTitleAr,
  ] = useState("");

  const [
    descriptionDe,
    setDescriptionDe,
  ] = useState("");

  const [
    descriptionAr,
    setDescriptionAr,
  ] = useState("");

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    videoFile,
    setVideoFile,
  ] = useState(null);

  const videoInputRef =
    useRef(null);

  const [
    videoPreview,
    setVideoPreview,
  ] = useState("");

  const [
    existingVideoUrl,
    setExistingVideoUrl,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadVideos =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await videoRequest("/");

        setVideos(
          data.videos || []
        );
      } catch (requestError) {
        setError(
          requestError.message ||
            t.adminVideos.loadError
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    if (
      !authLoading &&
      user?.role === "admin"
    ) {
      loadVideos();
    }
  }, [
    authLoading,
    user,
    loadVideos,
  ]);

  useEffect(() => {
    return () => {
      if (
        videoPreview &&
        videoPreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          videoPreview
        );
      }
    };
  }, [videoPreview]);

  if (authLoading) {
    return (
      <main className="min-h-[calc(100vh-86px)] bg-slate-950 px-6 py-16 text-center text-slate-300">
        Checking admin access...
      </main>
    );
  }

  if (
    user?.role !== "admin"
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const clearPreview = () => {
    if (
      videoPreview &&
      videoPreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        videoPreview
      );
    }

    setVideoPreview("");
  };

  const resetForm = () => {
    clearPreview();

    setTitle("");
    setTitleDe("");
    setTitleAr("");

    setDescription("");
    setDescriptionDe("");
    setDescriptionAr("");
    setEditingId(null);
    setVideoFile(null);

    if (videoInputRef.current) {
      videoInputRef.current.value =
        "";
    }

    setExistingVideoUrl("");
    setError("");
  };

  const handleVideoChange =
    (event) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      setError("");
      setMessage("");

      if (
        !ALLOWED_VIDEO_TYPES
          .includes(file.type)
      ) {
        event.target.value =
          "";

        setError(
          t.adminVideos.chooseMp4Webm
        );

        return;
      }

      if (
        file.size >
        MAX_VIDEO_SIZE
      ) {
        event.target.value =
          "";

        setError(
          t.adminVideos.maxSizeError
        );

        return;
      }

      clearPreview();

      const preview =
        URL.createObjectURL(file);

      setVideoFile(file);
      setVideoPreview(
        preview
      );
    };

  const handleEdit =
    (video) => {
      clearPreview();

      setEditingId(
        video.id
      );

      setTitle(
        video.title || ""
      );

      setDescription(
        video.description ||
          ""
      );

      setVideoFile(null);

      setExistingVideoUrl(
        getVideoUrl(
          video.videoUrl
        )
      );

      setError("");
      setMessage("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      const cleanTitle =
        title.trim();

      if (!cleanTitle) {
        setError(
          t.adminVideos.titleRequired
        );

        return;
      }

      if (
        cleanTitle.length >
        200
      ) {
        setError(
          t.adminVideos.titleTooLong
        );

        return;
      }

      if (
        description.trim()
          .length > 5000
      ) {
        setError(
          t.adminVideos.descriptionTooLong
        );

        return;
      }

      const formElement =
        event.currentTarget;

      const formData =
        new FormData(
          formElement
        );

      const formVideo =
        formData.get(
          "video"
        );

      const selectedFile =
        formVideo instanceof File &&
        formVideo.size > 0
          ? formVideo
          : null;

      if (
        !editingId &&
        !selectedFile
      ) {
        setError(
          "Please choose a video file."
        );

        return;
      }

      if (
        selectedFile &&
        !ALLOWED_VIDEO_TYPES.includes(
          selectedFile.type
        )
      ) {
        setError(
          t.adminVideos.chooseMp4Webm
        );

        return;
      }

      if (
        selectedFile &&
        selectedFile.size >
          MAX_VIDEO_SIZE
      ) {
        setError(
          t.adminVideos.maxSizeError
        );

        return;
      }

      formData.set(
        "title",
        cleanTitle
      );

      formData.set(
        "description",
        description.trim()
      );

      formData.set(
        "titleEn",
        cleanTitle
      );

      formData.set(
        "titleDe",
        titleDe.trim()
      );

      formData.set(
        "titleAr",
        titleAr.trim()
      );

      formData.set(
        "descriptionEn",
        description.trim()
      );

      formData.set(
        "descriptionDe",
        descriptionDe.trim()
      );

      formData.set(
        "descriptionAr",
        descriptionAr.trim()
      );

      if (!selectedFile) {
        formData.delete(
          "video"
        );
      }

      setSaving(true);

      try {
        if (editingId) {
          const data =
            await videoRequest(
              `/${editingId}`,
              {
                method: "PATCH",
                body: formData,
              }
            );

          setMessage(
            data.replacedVideo
              ? t.adminVideos.updateReplacementSuccess
              : t.adminVideos.updateKeepSuccess
          );
        } else {
          await videoRequest(
            "/",
            {
              method: "POST",
              body: formData,
            }
          );

          setMessage(
            t.adminVideos.uploadSuccess
          );
        }

        resetForm();

        await loadVideos();
      } catch (requestError) {
        setError(
          requestError.message ||
            t.adminVideos.saveError
        );
      } finally {
        setSaving(false);
      }
    };

  const handleDelete =
    async (video) => {
      const confirmed =
        window.confirm(
          `${t.adminVideos.deleteConfirmPrefix} "${video.title}"${t.adminVideos.deleteConfirmSuffix}`
        );

      if (!confirmed) {
        return;
      }

      setError("");
      setMessage("");

      try {
        await videoRequest(
          `/${video.id}`,
          {
            method: "DELETE",
          }
        );

        if (
          editingId ===
          video.id
        ) {
          resetForm();
        }

        setMessage(
          t.adminVideos.deleteSuccess
        );

        await loadVideos();
      } catch (requestError) {
        setError(
          requestError.message ||
            t.adminVideos.deleteError
        );
      }
    };

  const currentPreview =
    videoPreview ||
    existingVideoUrl;

  return (
    <main className="min-h-[calc(100vh-86px)] bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-10">
          <div className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">{t.adminVideos.badge}</div>

          <h1 className="text-3xl font-bold sm:text-4xl">{t.adminVideos.title}</h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            {t.adminVideos.intro}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl sm:p-8">
          <h2 className="text-xl font-bold">
            {editingId
              ? t.adminVideos.editVideo
              : t.adminVideos.uploadNewVideo}
          </h2>

          <form
            onSubmit={
              handleSubmit
            }
            encType="multipart/form-data"
            className="mt-6 space-y-6"
          >
            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="video-title"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  {t.adminVideos.titleEnglish}
                </label>

                <input
                  id="video-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder={
                    t.adminVideos
                      .titlePlaceholder
                  }
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label
                  htmlFor="video-title-de"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  {t.adminVideos.titleGerman}
                </label>

                <input
                  id="video-title-de"
                  type="text"
                  value={titleDe}
                  onChange={(event) =>
                    setTitleDe(
                      event.target.value
                    )
                  }
                  placeholder={
                    t.adminVideos
                      .titleGermanPlaceholder
                  }
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label
                  htmlFor="video-title-ar"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  {t.adminVideos.titleArabic}
                </label>

                <input
                  id="video-title-ar"
                  type="text"
                  dir="rtl"
                  value={titleAr}
                  onChange={(event) =>
                    setTitleAr(
                      event.target.value
                    )
                  }
                  placeholder={
                    t.adminVideos
                      .titleArabicPlaceholder
                  }
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-right text-white outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="video-description"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  {t.adminVideos.descriptionEnglish}
                </label>

                <textarea
                  id="video-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder={
                    t.adminVideos
                      .descriptionPlaceholder
                  }
                  maxLength={5000}
                  rows={6}
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label
                  htmlFor="video-description-de"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  {t.adminVideos.descriptionGerman}
                </label>

                <textarea
                  id="video-description-de"
                  value={descriptionDe}
                  onChange={(event) =>
                    setDescriptionDe(
                      event.target.value
                    )
                  }
                  placeholder={
                    t.adminVideos
                      .descriptionGermanPlaceholder
                  }
                  maxLength={5000}
                  rows={6}
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label
                  htmlFor="video-description-ar"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  {t.adminVideos.descriptionArabic}
                </label>

                <textarea
                  id="video-description-ar"
                  dir="rtl"
                  value={descriptionAr}
                  onChange={(event) =>
                    setDescriptionAr(
                      event.target.value
                    )
                  }
                  placeholder={
                    t.adminVideos
                      .descriptionArabicPlaceholder
                  }
                  maxLength={5000}
                  rows={6}
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-right text-white outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="video-file"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                {editingId
                  ? t.adminVideos.replaceVideoFile
                  : t.adminVideos.videoFile}
              </label>

              <p className="mb-3 text-sm text-slate-400">
                {t.adminVideos.fileHelp}
                {editingId
                  ? t.adminVideos.keepExisting
                  : ""}
              </p>

              <input
                ref={videoInputRef}
                id="video-file"
                name="video"
                type="file"
                accept="video/mp4,video/webm"
                onChange={
                  handleVideoChange
                }
                className="block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:font-semibold file:text-slate-950 hover:file:bg-cyan-400"
              />
            </div>

            {videoFile && (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-slate-300">
                <div>
                  Selected:
                  {" "}
                  <strong className="text-white">
                    {
                      videoFile.name
                    }
                  </strong>
                </div>

                <div className="mt-1">
                  Size:
                  {" "}
                  {formatVideoSize(
                    videoFile.size
                  )}
                </div>
              </div>
            )}

            {currentPreview && (
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-200">{t.adminVideos.preview}</p>

                <video
                  key={
                    currentPreview
                  }
                  controls
                  playsInline
                  preload="metadata"
                  src={
                    currentPreview
                  }
                  className="aspect-video w-full max-w-3xl rounded-xl bg-black object-contain"
                />

                {videoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      clearPreview();
                      setVideoFile(
                        null
                      );

                      if (
                        videoInputRef.current
                      ) {
                        videoInputRef.current.value =
                          "";
                      }
                    }}
                    className="mt-3 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >{t.adminVideos.clearSelected}</button>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                {message}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? t.adminVideos.saveChanges
                    : t.adminVideos.uploadVideo}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">{t.adminVideos.savedVideos}</h2>

            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-400">
              {videos.length}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-400">
              {t.adminVideos.loadingVideos}
            </div>
          ) : videos.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center text-slate-400">
              No videos have been
              uploaded yet.
            </div>
          ) : (
            <div className="space-y-6">
              {videos.map(
                (video) => (
                  <article
                    key={
                      video.id
                    }
                    className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:grid-cols-[280px_1fr]"
                  >
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      className="aspect-video w-full rounded-xl bg-black object-contain"
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
                    </video>

                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-bold">
                        {
                          video.title
                        }
                      </h3>

                      {video.description && (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                          {
                            video.description
                          }
                        </p>
                      )}

                      <div className="mt-3 text-xs text-slate-500">
                        {formatVideoSize(
                          video.videoSize
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              video
                            )
                          }
                          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >{t.adminVideos.edit}</button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              video
                            )
                          }
                          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                        >{t.adminVideos.delete}</button>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminVideos;
