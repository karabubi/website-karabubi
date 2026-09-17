import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

const TOKEN_KEY =
  "websiteKarabubiToken";

async function poetryRequest(
  path = "",
  options = {}
) {
  const token =
    localStorage.getItem(TOKEN_KEY);

  const response = await fetch(
    `${API_URL}/wisdom-poetry${path}`,
    {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
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
        "Wisdom poetry request failed."
    );
  }

  return data;
}

function AdminWisdomPoetry() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [poems, setPoems] =
    useState([]);

  const [title, setTitle] =
    useState("");

  const [author, setAuthor] =
    useState("");

  const [poem, setPoem] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadPoems = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await poetryRequest("/");

        setPoems(data.poems || []);
      } catch (requestError) {
        setError(
          requestError.message ||
            "Unable to load poems."
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
      loadPoems();
    }
  }, [
    authLoading,
    user,
    loadPoems,
  ]);

  if (authLoading) {
    return (
      <main className="min-h-[calc(100vh-86px)] bg-slate-950 px-6 py-16 text-center text-slate-300">
        Loading administrator...
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

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setPoem("");
    setEditingId(null);
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const normalizedPoem =
      poem.trim();

    if (!normalizedPoem) {
      setError(
        "Please enter the poetry text."
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      title: title.trim(),
      author: author.trim(),
      poem: normalizedPoem,
    };

    try {
      if (editingId) {
        await poetryRequest(
          `/${editingId}`,
          {
            method: "PATCH",
            body: JSON.stringify(
              payload
            ),
          }
        );

        setMessage(
          "Poem updated successfully."
        );
      } else {
        await poetryRequest("/", {
          method: "POST",
          body: JSON.stringify(
            payload
          ),
        });

        setMessage(
          "Poem added successfully."
        );
      }

      resetForm();
      await loadPoems();
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to save poem."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setAuthor(item.author || "");
    setPoem(item.poem || "");
    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deletePoem = async (
    item
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this poem?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await poetryRequest(
        `/${item.id}`,
        {
          method: "DELETE",
        }
      );

      if (editingId === item.id) {
        resetForm();
      }

      setMessage(
        "Poem deleted successfully."
      );

      await loadPoems();
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to delete poem."
      );
    }
  };

  return (
    <main className="min-h-[calc(100vh-86px)] bg-[#050816] px-6 py-14 text-slate-100">
      <section className="mx-auto w-full max-w-6xl">

        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-400">
          Administration
        </span>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
          Wisdom Poetry
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-400">
          Add, edit and manage wisdom-themed poetry shown on the public website.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl"
        >
          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label
                htmlFor="poetry-title"
                className="font-semibold text-slate-200"
              >
                Title
              </label>

              <input
                id="poetry-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                maxLength={200}
                placeholder="Example: The Value of Time"
                className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label
                htmlFor="poetry-author"
                className="font-semibold text-slate-200"
              >
                Author
              </label>

              <input
                id="poetry-author"
                type="text"
                value={author}
                onChange={(event) =>
                  setAuthor(event.target.value)
                }
                maxLength={200}
                placeholder="Example: Imam Al-Shafi'i"
                className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100 outline-none focus:border-violet-500"
              />
            </div>

          </div>

          <div className="mt-5">
            <label
              htmlFor="poetry-text"
              className="font-semibold text-slate-200"
            >
              Poetry
            </label>

            <textarea
              id="poetry-text"
              value={poem}
              onChange={(event) =>
                setPoem(event.target.value)
              }
              maxLength={5000}
              rows={10}
              placeholder={`Enter the poem here...

Each line can be written on a new line.`}
              className="mt-3 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 text-lg leading-8 text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-500"
            />

            <div className="mt-2 text-end text-sm text-slate-500">
              {poem.length}/5000
            </div>
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
              className="cursor-pointer rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Poetry"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:border-slate-500 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mt-12">

          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">
              Saved Poetry
            </h2>

            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
              {poems.length}
            </span>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-400">
              Loading poems...
            </p>
          ) : poems.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
              No poetry has been added yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-5">
              {poems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row">

                    <div className="min-w-0 flex-1">

                      {item.title && (
                        <h3 className="text-xl font-bold text-white">
                          {item.title}
                        </h3>
                      )}

                      {item.author && (
                        <p className="mt-2 text-sm font-medium text-violet-300">
                          — {item.author}
                        </p>
                      )}

                      <p
                        dir="auto"
                        className="mt-5 whitespace-pre-line text-lg leading-8 text-slate-300"
                      >
                        {item.poem}
                      </p>

                    </div>

                    <div className="flex shrink-0 gap-3 md:flex-col">

                      <button
                        type="button"
                        onClick={() =>
                          startEdit(item)
                        }
                        className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deletePoem(item)
                        }
                        className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
                      >
                        Delete
                      </button>

                    </div>
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

export default AdminWisdomPoetry;
