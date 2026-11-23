import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

const TOKEN_KEY =
  "websiteKarabubiToken";

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

function getReflectionImageUrl(
  imageUrl
) {
  if (!imageUrl) {
    return "";
  }

  if (
    /^https?:\/\//i.test(
      imageUrl
    )
  ) {
    return imageUrl;
  }

  return (
    API_URL +
    (
      imageUrl.startsWith("/")
        ? imageUrl
        : `/${imageUrl}`
    )
  );
}

async function reflectionRequest(
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
    options.body instanceof FormData;

  const response = await fetch(
    `${API_URL}/literary-reflections${path}`,
    {
      ...options,

      credentials: "include",

      headers: {
        ...(
          !isFormData &&
          options.body
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

        ...(options.headers || {}),
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
      "Literary reflections request failed."
    );
  }

  return data;
}

function AdminLiteraryReflections() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [reflections, setReflections] =
    useState([]);

  const [title, setTitle] =
    useState("");

  const [author, setAuthor] =
    useState("");

  const [reflection, setReflection] =
    useState("");

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    imageFile,
    setImageFile,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

  const [
    existingImageUrl,
    setExistingImageUrl,
  ] = useState("");

  const [
    removeImage,
    setRemoveImage,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const reflectionTextareaRef =
    useRef(null);

  const uploadedImages = useMemo(
    () =>
      reflections.filter(
        (item) => item.imageUrl
      ),
    [reflections]
  );

  useEffect(() => {
    const textarea =
      reflectionTextareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(
      360,
      textarea.scrollHeight
    )}px`;
  }, [reflection]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

  const loadReflections = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await reflectionRequest(
            "/"
          );

        setReflections(
          data.reflections || []
        );
      } catch (
        requestError
      ) {
        setError(
          requestError.message ||
          "Unable to load reflections."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (
      !authLoading &&
      user?.role === "admin"
    ) {
      loadReflections();
    }
  }, [
    authLoading,
    user,
    loadReflections,
  ]);

  if (authLoading) {
    return (
      <main className="min-h-[calc(100vh-86px)] bg-slate-950 px-6 py-16 text-center text-slate-300">
        Loading administrator...
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

  const activeImagePreview =
    imagePreview ||
    (
      !removeImage &&
      existingImageUrl
        ? getReflectionImageUrl(
            existingImageUrl
          )
        : ""
    );

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setReflection("");

    setImageFile(null);
    setImagePreview("");
    setExistingImageUrl("");
    setRemoveImage(false);

    setEditingId(null);
  };

  const handleImageChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !ALLOWED_IMAGE_TYPES.has(
        file.type
      )
    ) {
      setError(
        "Please select a JPG, PNG or WEBP image."
      );

      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setError(
        "Image must be 10 MB or smaller."
      );

      return;
    }

    const preview =
      URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(preview);
    setRemoveImage(false);

    setError("");
    setMessage("");
  };

  const handleRemoveImage =
    () => {
      setImageFile(null);
      setImagePreview("");

      setRemoveImage(
        Boolean(
          existingImageUrl
        )
      );

      setError("");
      setMessage("");
    };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const normalizedReflection =
      reflection.trim();

    if (!normalizedReflection) {
      setError(
        "Please enter the reflection text."
      );

      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const formData =
      new FormData();

    formData.append(
      "title",
      title.trim()
    );

    formData.append(
      "author",
      author.trim()
    );

    formData.append(
      "reflection",
      normalizedReflection
    );

    formData.append(
      "removeImage",
      String(removeImage)
    );

    if (imageFile) {
      formData.append(
        "image",
        imageFile
      );
    }

    try {
      if (editingId) {
        await reflectionRequest(
          `/${editingId}`,
          {
            method: "PATCH",
            body: formData,
          }
        );

        setMessage(
          "Reflection updated successfully."
        );
      } else {
        await reflectionRequest(
          "/",
          {
            method: "POST",
            body: formData,
          }
        );

        setMessage(
          "Reflection added successfully."
        );
      }

      resetForm();

      await loadReflections();
    } catch (
      requestError
    ) {
      setError(
        requestError.message ||
        "Unable to save reflection."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (
    item
  ) => {
    setEditingId(
      item.id
    );

    setTitle(
      item.title || ""
    );

    setAuthor(
      item.author || ""
    );

    setReflection(
      item.reflection || ""
    );

    setImageFile(null);
    setImagePreview("");

    setExistingImageUrl(
      item.imageUrl || ""
    );

    setRemoveImage(false);

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteReflection =
    async (item) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this reflection?"
        );

      if (!confirmed) {
        return;
      }

      setError("");
      setMessage("");

      try {
        await reflectionRequest(
          `/${item.id}`,
          {
            method: "DELETE",
          }
        );

        if (
          editingId ===
          item.id
        ) {
          resetForm();
        }

        setMessage(
          "Reflection deleted successfully."
        );

        await loadReflections();
      } catch (
        requestError
      ) {
        setError(
          requestError.message ||
          "Unable to delete reflection."
        );
      }
    };

  return (
    <main className="relative isolate min-h-[calc(100vh-76px)] overflow-hidden bg-[#050816] px-4 py-10 text-slate-100 sm:px-6 sm:py-14 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-48 h-[520px] w-[520px] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute -right-52 top-52 h-[560px] w-[560px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      </div>

      <section className="mx-auto w-full max-w-7xl">
        <header className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-white/[0.075] to-white/[0.025] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="absolute end-0 top-0 h-36 w-36 translate-x-1/3 -translate-y-1/3 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-400/[0.08] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-200">
                <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(167,139,250,.9)]" />
                Administration
              </span>

              <h1 className="mt-5 bg-gradient-to-r from-white via-violet-100 to-blue-200 bg-clip-text text-3xl font-black tracking-[-0.035em] text-transparent sm:text-4xl lg:text-5xl">
                Literary Reflections
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                Write without losing context. Your complete reflection and artwork stay visible while you compose.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-slate-950/40 px-4 py-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15 text-lg text-violet-300">✦</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Published</p>
                <p className="mt-0.5 text-xl font-bold text-white">{reflections.length}</p>
              </div>
            </div>
          </div>
        </header>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-8 rounded-[28px] border border-white/[0.08] bg-[#0b1020]/80 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-7 lg:p-8"
        >
          <div className="mb-7 flex flex-col gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{editingId ? "Edit reflection" : "New reflection"}</h2>
              <p className="mt-1 text-sm text-slate-500">Write on the left and review the finished presentation on the right.</p>
            </div>
            <span className="w-fit rounded-xl border border-violet-400/15 bg-violet-500/[0.08] px-3 py-2 text-xs font-semibold text-violet-200">Live writing studio</span>
          </div>
          <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
            <div className="min-w-0">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="reflection-title"
                className="font-semibold text-slate-200"
              >
                Title
              </label>

              <input
                id="reflection-title"
                type="text"
                value={title}
                onChange={(
                  event
                ) =>
                  setTitle(
                    event.target
                      .value
                  )
                }
                maxLength={200}
                placeholder="Example: The Value of Time"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="reflection-author"
                className="font-semibold text-slate-200"
              >
                Author
              </label>

              <input
                id="reflection-author"
                type="text"
                value={author}
                onChange={(
                  event
                ) =>
                  setAuthor(
                    event.target
                      .value
                  )
                }
                maxLength={200}
                placeholder="Example: Imam Al-Shafi'i"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="reflection-text"
              className="font-semibold text-slate-200"
            >
              Reflection
            </label>

            <textarea
              ref={reflectionTextareaRef}
              id="reflection-text"
              value={reflection}
              onChange={(
                event
              ) =>
                setReflection(
                  event.target
                    .value
                )
              }
              maxLength={5000}
              rows={14}
              placeholder={`Enter the reflection here...
Each line can be written on a new line.`}
              className="mt-3 min-h-[360px] w-full resize-none overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-lg leading-8 text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
            />

            <div className="mt-2 text-end text-sm text-slate-500">
              {reflection.length}/5000
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/[0.08] bg-slate-950/50 p-5 sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              <div className="flex-1">
                <label
                  htmlFor="reflection-image"
                  className="font-semibold text-slate-200"
                >
                  Reflection Image
                </label>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Optional. JPG, PNG
                  or WEBP. Maximum
                  size 10 MB.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <label
                    htmlFor="reflection-image"
                    className="cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 focus-within:ring-4 focus-within:ring-violet-500/20"
                  >
                    Choose Image
                  </label>

                  <input
                    id="reflection-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleImageChange
                    }
                    className="sr-only"
                  />

                  {activeImagePreview && (
                    <button
                      type="button"
                      onClick={
                        handleRemoveImage
                      }
                      className="cursor-pointer rounded-xl border border-red-500/40 px-5 py-2.5 font-semibold text-red-300 transition hover:bg-red-500/10"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {imageFile && (
                  <p className="mt-3 break-all text-sm text-violet-300">
                    Selected:{" "}
                    {imageFile.name}
                  </p>
                )}

                {removeImage &&
                  !imageFile && (
                    <p className="mt-3 text-sm text-amber-300">
                      The current
                      image will be
                      removed when
                      you save.
                    </p>
                  )}
              </div>

              <div className="w-full md:w-72">
                {activeImagePreview ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
                    <img
                      src={
                        activeImagePreview
                      }
                      alt="Reflection preview"
                      className="h-56 w-full object-contain"
                    />
                  </div>
                ) : (
                  <label htmlFor="reflection-image" className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-5 text-center transition hover:border-violet-400/40 hover:bg-violet-500/[0.04]">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-2xl text-violet-300">+</span>
                    <span className="mt-3 text-sm font-semibold text-slate-300">Add artwork</span>
                    <span className="mt-1 text-xs text-slate-500">Preview appears here</span>
                  </label>
                )}
              </div>
            </div>
          </div>

            </div>

            <aside className="xl:sticky xl:top-6">
              <div className="overflow-hidden rounded-[26px] border border-white/[0.1] bg-gradient-to-b from-[#12182b] to-[#080c18] shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.75)]" />
                    <span className="text-sm font-semibold text-slate-200">Live preview</span>
                  </div>
                  <span className="text-xs text-slate-500">Public view</span>
                </div>

                {activeImagePreview ? (
                  <div className="border-b border-white/[0.08] bg-black/20 p-3">
                    <img
                      src={activeImagePreview}
                      alt="Current reflection artwork"
                      className="max-h-80 w-full rounded-2xl object-contain"
                    />
                  </div>
                ) : (
                  <div className="grid h-36 place-items-center border-b border-dashed border-white/[0.08] bg-violet-500/[0.025] px-6 text-center">
                    <p className="text-sm text-slate-500">Your optional artwork will be shown here.</p>
                  </div>
                )}

                <div className="p-6 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300">Literary reflection</p>
                  <h3 dir="auto" className="mt-4 break-words text-2xl font-bold leading-tight text-white">
                    {title.trim() || "Your title will appear here"}
                  </h3>
                  <p dir="auto" className="mt-2 text-sm font-medium text-violet-300">
                    {author.trim() ? `— ${author.trim()}` : "Author is optional"}
                  </p>
                  <div className="my-5 h-px bg-gradient-to-r from-violet-400/40 via-white/10 to-transparent" />
                  <p dir="auto" className={`whitespace-pre-wrap break-words text-lg leading-8 ${reflection.trim() ? "text-slate-200" : "text-slate-500"}`}>
                    {reflection || "Start writing your reflection. Every line and paragraph will stay visible in this preview."}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Characters</p>
                  <p className="mt-1 text-lg font-bold text-white">{reflection.length}<span className="text-sm font-normal text-slate-600"> / 5000</span></p>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Artwork</p>
                  <p className="mt-1 text-lg font-bold text-white">{activeImagePreview ? "Ready" : "Optional"}</p>
                </div>
              </div>
            </aside>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-300">
              {message}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Reflection"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={
                  resetForm
                }
                className="cursor-pointer rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:border-slate-500 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="mt-10 rounded-[28px] border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-sm sm:p-7" aria-labelledby="reflection-media-title">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Media library</p>
              <h2 id="reflection-media-title" className="mt-2 text-2xl font-bold text-white">All uploaded artwork</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Every image currently used by a saved reflection is visible here.</p>
            </div>
            <span className="w-fit rounded-full border border-white/[0.08] bg-slate-950/60 px-3 py-1.5 text-sm text-slate-300">
              {uploadedImages.length} {uploadedImages.length === 1 ? "image" : "images"}
            </span>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-400">Loading artwork...</p>
          ) : uploadedImages.length === 0 ? (
            <label htmlFor="reflection-image" className="mt-6 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/[0.1] bg-slate-950/30 px-6 text-center transition hover:border-violet-400/30 hover:bg-violet-500/[0.03]">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-2xl text-violet-300">+</span>
              <span className="mt-3 font-semibold text-slate-200">No artwork uploaded yet</span>
              <span className="mt-1 text-sm text-slate-500">Choose an image in the editor to start the collection.</span>
            </label>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {uploadedImages.map((item) => (
                <button
                  key={`media-${item.id}`}
                  type="button"
                  onClick={() => startEdit(item)}
                  className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/50 text-left transition hover:-translate-y-0.5 hover:border-violet-400/30 focus:outline-none focus:ring-4 focus:ring-violet-500/15"
                  title="Open this reflection in the editor"
                >
                  <div className="aspect-square overflow-hidden bg-black/20">
                    <img
                      src={getReflectionImageUrl(item.imageUrl)}
                      alt={item.title || item.author || "Literary reflection artwork"}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-3">
                    <p dir="auto" className="truncate text-sm font-semibold text-slate-200">
                      {item.title || "Untitled reflection"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Select to edit</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="mt-12 rounded-[28px] border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-sm sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">
              Saved Reflections
            </h2>

            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
              {reflections.length}
            </span>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-400">
              Loading reflections...
            </p>
          ) : reflections.length ===
            0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
              No reflection has been
              added yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-5">
              {reflections.map(
                (item) => (
                  <article
                    key={
                      item.id
                    }
                    className="group rounded-3xl border border-white/[0.08] bg-[#0b1020]/75 p-5 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-violet-400/20 hover:shadow-2xl hover:shadow-violet-950/10 sm:p-6"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row">
                      {item.imageUrl && (
                        <div className="w-full shrink-0 lg:w-56">
                          <img
                            src={getReflectionImageUrl(
                              item.imageUrl
                            )}
                            alt={
                              item.title ||
                              item.author ||
                              "Reflection"
                            }
                            className="h-52 w-full rounded-2xl border border-slate-800 bg-slate-950 object-contain"
                          />
                        </div>
                      )}

                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-5 md:flex-row">
                        <div className="min-w-0 flex-1">
                          {item.title && (
                            <h3
                              dir="auto"
                              className="text-xl font-bold text-white"
                            >
                              {
                                item.title
                              }
                            </h3>
                          )}

                          {item.author && (
                            <p
                              dir="auto"
                              className="mt-2 text-sm font-medium text-violet-300"
                            >
                              —{" "}
                              {
                                item.author
                              }
                            </p>
                          )}

                          <p
                            dir="auto"
                            className="mt-5 whitespace-pre-line text-lg leading-8 text-slate-300"
                          >
                            {
                              item.reflection
                            }
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-3 md:flex-col">
                          <button
                            type="button"
                            onClick={() =>
                              startEdit(
                                item
                              )
                            }
                            className="cursor-pointer rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-2 font-semibold text-blue-200 transition hover:bg-blue-500/20 hover:text-white"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteReflection(
                                item
                              )
                            }
                            className="cursor-pointer rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 font-semibold text-red-200 transition hover:bg-red-500/20 hover:text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default AdminLiteraryReflections;
