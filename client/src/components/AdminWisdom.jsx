import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

const TOKEN_KEY =
  "websiteKarabubiToken";

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `${API_URL}${imageUrl}`;
};

async function wisdomRequest(
  path = "",
  options = {}
) {
  const token =
    localStorage.getItem(TOKEN_KEY);

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const response = await fetch(
    `${API_URL}/wisdom${path}`,
    {
      ...options,
      credentials: "include",
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
        ...(options.headers || {}),
      },
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Wisdom request failed."
    );
  }

  return data;
}

function AdminWisdom() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const { t } = useLanguage();

  const [quotes, setQuotes] =
    useState([]);

  const [quote, setQuote] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [imageFile, setImageFile] =
    useState(null);

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

  const loadQuotes = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await wisdomRequest("/");

        setQuotes(
          data.quotes || []
        );
      } catch (requestError) {
        setError(
          requestError.message ||
            t.adminWisdom.loadError
        );
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (
      !authLoading &&
      user?.role === "admin"
    ) {
      loadQuotes();
    }
  }, [
    authLoading,
    user,
    loadQuotes,
  ]);

  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

  if (authLoading) {
    return (
      <main className="min-h-[calc(100vh-86px)] bg-slate-950 px-6 py-16 text-center text-slate-300">
        {t.adminWisdom.loading}
      </main>
    );
  }

  if (user?.role !== "admin") {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const clearPreview = () => {
    if (
      imagePreview &&
      imagePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImagePreview("");
  };

  const resetForm = () => {
    clearPreview();

    setQuote("");
    setEditingId(null);
    setImageFile(null);
    setExistingImageUrl("");
    setRemoveImage(false);
  };

  const handleImageChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      event.target.value = "";

      setError(
        "Please choose a JPG, PNG or WEBP image."
      );

      return;
    }

    if (
      file.size > MAX_IMAGE_SIZE
    ) {
      event.target.value = "";

      setError(
        "Image must not exceed 10 MB."
      );

      return;
    }

    clearPreview();

    setImageFile(file);
    setImagePreview(
      URL.createObjectURL(file)
    );

    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    clearPreview();

    setImageFile(null);
    setRemoveImage(true);
  };

  const handleKeepImage = () => {
    setRemoveImage(false);
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const normalized =
      quote.trim();

    if (!normalized) {
      setError(
        t.adminWisdom.quoteRequired
      );

      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData =
        new FormData();

      formData.append(
        "quote",
        normalized
      );

      formData.append(
        "removeImage",
        removeImage
          ? "true"
          : "false"
      );

      if (imageFile) {
        formData.append(
          "image",
          imageFile
        );
      }

      if (editingId) {
        await wisdomRequest(
          `/${editingId}`,
          {
            method: "PATCH",
            body: formData,
          }
        );

        setMessage(
          t.adminWisdom.updateSuccess
        );
      } else {
        await wisdomRequest("/", {
          method: "POST",
          body: formData,
        });

        setMessage(
          t.adminWisdom.createSuccess
        );
      }

      resetForm();

      await loadQuotes();
    } catch (requestError) {
      setError(
        requestError.message ||
          t.adminWisdom.saveError
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    clearPreview();

    setEditingId(item.id);

    setQuote(
      item.quote || ""
    );

    setImageFile(null);

    setExistingImageUrl(
      getImageUrl(
        item.imageUrl
      )
    );

    setRemoveImage(false);

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteQuote = async (
    item
  ) => {
    const confirmed =
      window.confirm(
        t.adminWisdom.deleteConfirm
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await wisdomRequest(
        `/${item.id}`,
        {
          method: "DELETE",
        }
      );

      if (
        editingId === item.id
      ) {
        resetForm();
      }

      setMessage(
        t.adminWisdom.deleteSuccess
      );

      await loadQuotes();
    } catch (requestError) {
      setError(
        requestError.message ||
          t.adminWisdom.deleteError
      );
    }
  };

  const activePreview =
    imagePreview ||
    (
      !removeImage
        ? existingImageUrl
        : ""
    );

  return (
    <main className="min-h-[calc(100vh-86px)] bg-slate-950 px-6 py-14 text-slate-100 max-[640px]:px-4 max-[640px]:py-10">
      <section className="mx-auto w-full max-w-5xl">
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">
          {t.adminWisdom.eyebrow}
        </span>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white max-[640px]:text-3xl">
          {t.adminWisdom.title}
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-400">
          {t.adminWisdom.description}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
        >
          <label
            htmlFor="wisdom-quote"
            className="font-semibold text-slate-200"
          >
            {editingId
              ? t.adminWisdom.editQuote
              : t.adminWisdom.newQuote}
          </label>

          <textarea
            id="wisdom-quote"
            value={quote}
            onChange={(event) =>
              setQuote(
                event.target.value
              )
            }
            maxLength={1000}
            rows={5}
            placeholder={
              t.adminWisdom.placeholder
            }
            className="mt-3 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-blue-500"
          />

          <div className="mt-2 text-end text-sm text-slate-500">
            {quote.length}/1000
          </div>

          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-amber-100">
                  Pearl of Wisdom Image
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Optional image shown with this wisdom quote.
                  JPG, PNG or WEBP. Maximum size 10 MB.
                </p>
              </div>

              <label className="cursor-pointer rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 font-semibold text-amber-200 transition hover:bg-amber-400/20">
                Choose Image

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />
              </label>
            </div>

            {imageFile && (
              <p className="mt-3 text-sm text-slate-300">
                Selected:{" "}
                <span className="font-medium text-white">
                  {imageFile.name}
                </span>
              </p>
            )}

            {activePreview && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-slate-300">
                  Image preview
                </p>

                <div className="flex justify-center overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-3">
                  <img
                    src={activePreview}
                    alt="Pearl of Wisdom preview"
                    className="max-h-[360px] max-w-full rounded-xl object-contain"
                  />
                </div>
              </div>
            )}

            {existingImageUrl &&
              !imageFile &&
              !removeImage && (
                <button
                  type="button"
                  onClick={
                    handleRemoveImage
                  }
                  className="mt-4 cursor-pointer rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 font-semibold text-red-300 transition hover:bg-red-500/20"
                >
                  Remove Image
                </button>
              )}

            {imageFile && (
              <button
                type="button"
                onClick={
                  handleRemoveImage
                }
                className="mt-4 cursor-pointer rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 font-semibold text-red-300 transition hover:bg-red-500/20"
              >
                Clear Selected Image
              </button>
            )}

            {removeImage &&
              existingImageUrl && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-red-300">
                    Existing image will be removed when you save.
                  </span>

                  <button
                    type="button"
                    onClick={
                      handleKeepImage
                    }
                    className="cursor-pointer rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
                  >
                    Keep Existing Image
                  </button>
                </div>
              )}
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
              className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? t.adminWisdom.saving
                : editingId
                  ? t.adminWisdom.saveChanges
                  : t.adminWisdom.addQuote}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
              >
                {t.adminWisdom.cancel}
              </button>
            )}
          </div>
        </form>

        <div className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">
              {t.adminWisdom.savedQuotes}
            </h2>

            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
              {quotes.length}
            </span>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-400">
              {t.adminWisdom.loading}
            </p>
          ) : quotes.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
              {t.adminWisdom.empty}
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {quotes.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                >
                  {item.imageUrl && (
                    <div className="mb-5 flex justify-center overflow-hidden rounded-xl border border-amber-400/15 bg-slate-950 p-3">
                      <img
                        src={getImageUrl(
                          item.imageUrl
                        )}
                        alt="Pearl of Wisdom"
                        className="max-h-[240px] max-w-full rounded-lg object-contain"
                      />
                    </div>
                  )}

                  <p className="whitespace-pre-wrap text-lg leading-8 text-slate-200">
                    {item.quote}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        startEdit(item)
                      }
                      className="cursor-pointer rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2 font-semibold text-blue-300 transition-colors hover:bg-blue-500/20"
                    >
                      {t.adminWisdom.edit}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteQuote(item)
                      }
                      className="cursor-pointer rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 font-semibold text-red-300 transition-colors hover:bg-red-500/20"
                    >
                      {t.adminWisdom.delete}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default AdminWisdom;
