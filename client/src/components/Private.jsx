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
  getPrivateDashboard,
} from "../api";

import {
  useAuth,
} from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

const TOKEN_KEY =
  "websiteKarabubiToken";

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = [
    "KB",
    "MB",
    "GB",
  ];

  let value = bytes / 1024;
  let unitIndex = 0;

  while (
    value >= 1024 &&
    unitIndex < units.length - 1
  ) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${
    value >= 10
      ? value.toFixed(1)
      : value.toFixed(2)
  } ${units[unitIndex]}`;
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

async function privateFetch(
  endpoint,
  options = {}
) {
  const token =
    localStorage.getItem(TOKEN_KEY);

  const headers =
    new Headers(options.headers || {});

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    let message =
      "The request could not be completed.";

    try {
      const body = await response.json();
      message =
        body.error ||
        body.message ||
        message;
    } catch {
      message =
        `${message} (${response.status})`;
    }

    throw new Error(message);
  }

  return response;
}

function getDisplayFilename(filename = "") {
  const value = String(filename);

  if (!value.includes("__")) {
    return value;
  }

  const parts = value.split("__");

  return (
    parts[parts.length - 1] ||
    value
  );
}

const Private = () => {
  const { t } = useLanguage();

  const {
    user,
    loading,
    isAuthenticated,
    logout,
  } = useAuth();

  const fileInputRef = useRef(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [photos, setPhotos] =
    useState([]);

  const [photosLoading, setPhotosLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [dragActive, setDragActive] =
    useState(false);

  const [editingPhoto, setEditingPhoto] =
    useState(null);

  const [editName, setEditName] =
    useState("");

  const [deletingPhoto, setDeletingPhoto] =
    useState(null);

  const [previewPhoto, setPreviewPhoto] =
    useState(null);


  const [photoActionLoading, setPhotoActionLoading] =
    useState(false);


  const [previewUrls, setPreviewUrls] =
    useState({});

  const loadPhotos = useCallback(
    async () => {
      setPhotosLoading(true);

      try {
        const response =
          await privateFetch(
            "/private/photos"
          );

        const body =
          await response.json();

        setPhotos(body.photos || []);
        setError("");
      } catch (err) {
        setError(
          err.message ||
          t.private.loadPhotosError
        );
      } finally {
        setPhotosLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadDashboard =
      async () => {
        try {
          const response =
            await getPrivateDashboard();

          setMessage(response.message);
        } catch (err) {
          setError(
            err.message ||
            t.private.loadDashboardError
          );
        }
      };

    loadDashboard();
    loadPhotos();
  }, [
    isAuthenticated,
    loadPhotos,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let cancelled = false;

    async function loadPreviews() {
      const nextUrls = {};

      for (const photo of photos) {
        try {
          const response =
            await privateFetch(
              photo.viewUrl
            );

          const blob =
            await response.blob();

          if (cancelled) {
            return;
          }

          nextUrls[photo.id] =
            URL.createObjectURL(blob);
        } catch {
          nextUrls[photo.id] = "";
        }
      }

      if (!cancelled) {
        setPreviewUrls(
          (previous) => {
            Object.values(previous).forEach(
              (url) => {
                if (url) {
                  URL.revokeObjectURL(url);
                }
              }
            );

            return nextUrls;
          }
        );
      }
    }

    loadPreviews();

    return () => {
      cancelled = true;
    };
  }, [
    photos,
    isAuthenticated,
  ]);

  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(
        (url) => {
          if (url) {
            URL.revokeObjectURL(url);
          }
        }
      );
    };
  }, [previewUrls]);

  useEffect(() => {
    if (
      !previewPhoto &&
      !editingPhoto &&
      !deletingPhoto
    ) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (previewPhoto) {
          setPreviewPhoto(null);
        }

        if (
          editingPhoto &&
          !photoActionLoading
        ) {
          setEditingPhoto(null);
        }

        if (
          deletingPhoto &&
          !photoActionLoading
        ) {
          setDeletingPhoto(null);
        }
      }

      if (previewPhoto) {
        if (event.key === "ArrowLeft") {
          movePreview(-1);
        }

        if (event.key === "ArrowRight") {
          movePreview(1);
        }
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    previewPhoto,
    editingPhoto,
    deletingPhoto,
    photoActionLoading,
    photos,
  ]);

  useEffect(() => {
    const modalOpen =
      Boolean(previewPhoto) ||
      Boolean(editingPhoto) ||
      Boolean(deletingPhoto);

    if (!modalOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    previewPhoto,
    editingPhoto,
    deletingPhoto,
  ]);

  async function uploadFiles(files) {
    const selected =
      Array.from(files || []);

    if (!selected.length) {
      return;
    }

    const valid = selected.filter(
      (file) =>
        [
          "image/jpeg",
          "image/png",
          "image/webp",
        ].includes(file.type)
    );

    if (
      valid.length !== selected.length
    ) {
      setError(
        t.private.invalidType
      );

      return;
    }

    if (valid.length > 10) {
      setError(
        t.private.tooManyPhotos
      );

      return;
    }

    const tooLarge =
      valid.find(
        (file) =>
          file.size >
          10 * 1024 * 1024
      );

    if (tooLarge) {
      setError(
        `${tooLarge.name} is larger than 10 MB.`
      );

      return;
    }

    const formData =
      new FormData();

    valid.forEach((file) => {
      formData.append(
        "photos",
        file
      );
    });

    setUploading(true);
    setError("");

    try {
      const response =
        await privateFetch(
          "/private/photos",
          {
            method: "POST",
            body: formData,
          }
        );

      const body =
        await response.json();

      setMessage(
        body.message ||
        t.private.uploadSuccess
      );

      await loadPhotos();
    } catch (err) {
      setError(
        err.message ||
        t.private.uploadError
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function openPreview(photo) {
    setPreviewPhoto(photo);
    setEditingPhoto(null);
    setDeletingPhoto(null);
  }

  function closePreview() {
    setPreviewPhoto(null);
  }

  function movePreview(direction) {
    if (
      !previewPhoto ||
      photos.length < 2
    ) {
      return;
    }

    const currentIndex =
      photos.findIndex(
        (photo) =>
          photo.id === previewPhoto.id
      );

    if (currentIndex < 0) {
      return;
    }

    const nextIndex =
      (
        currentIndex +
        direction +
        photos.length
      ) % photos.length;

    setPreviewPhoto(
      photos[nextIndex]
    );
  }

  function openEditPhoto(photo) {
    const name =
      photo.filename || "";

    const extensionIndex =
      name.lastIndexOf(".");

    const baseName =
      extensionIndex > 0
        ? name.slice(0, extensionIndex)
        : name;

    setEditingPhoto(photo);
    setEditName(baseName);
    setDeletingPhoto(null);
    setError("");
  }

  async function renamePhoto() {
    if (!editingPhoto) {
      return;
    }

    const cleanName =
      editName.trim();

    if (!cleanName) {
      setError(
        t.private.nameRequired
      );
      return;
    }

    setPhotoActionLoading(true);
    setError("");

    try {
      const response =
        await privateFetch(
          `/private/photos/${encodeURIComponent(
            editingPhoto.storedFilename
          )}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              filename: cleanName,
            }),
          }
        );

      const body =
        await response.json();

      setMessage(
        body.message ||
        t.private.renameSuccess
      );

      setEditingPhoto(null);
      setEditName("");

      await loadPhotos();
    } catch (err) {
      setError(
        err.message ||
        t.private.renameError
      );
    } finally {
      setPhotoActionLoading(false);
    }
  }

  async function deletePhoto() {
    if (!deletingPhoto) {
      return;
    }

    setPhotoActionLoading(true);
    setError("");

    try {
      const response =
        await privateFetch(
          `/private/photos/${encodeURIComponent(
            deletingPhoto.storedFilename
          )}`,
          {
            method: "DELETE",
          }
        );

      const body =
        await response.json();

      setMessage(
        body.message ||
        t.private.deleteSuccess
      );

      setDeletingPhoto(null);

      await loadPhotos();
    } catch (err) {
      setError(
        err.message ||
        t.private.deleteError
      );
    } finally {
      setPhotoActionLoading(false);
    }
  }

  async function downloadPhoto(photo) {
    try {
      const response =
        await privateFetch(
          photo.downloadUrl
        );

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download =
        photo.filename ||
        "photo";

      document.body.appendChild(anchor);

      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.message ||
        t.private.downloadError
      );
    }
  }

  if (loading) {
    return (
      <main className="private-library-page">
        <div className="private-loading-card">
          {t.private.loadingDashboard}
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <main className="private-library-page">
      <section className="private-library-shell">

        <header className="private-library-header">
          <div>
            <span className="private-library-eyebrow">
              {t.private.eyebrow}
            </span>

            <h1>
              {t.private.welcomeBack}
              {" "}
              {user?.name}
            </h1>

            <p>
              {t.private.description}
            </p>
          </div>

          <div className="private-header-actions">
            <button
              type="button"
              className="private-upload-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploading}
            >
              <span>＋</span>

              {uploading
                ? t.private.uploading
                : t.private.uploadPhotos}
            </button>

            <button
              type="button"
              className="private-signout-button"
              onClick={logout}
            >
              {t.private.signOut}
            </button>
          </div>
        </header>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(event) =>
            uploadFiles(
              event.target.files
            )
          }
        />

        {error && (
          <div className="private-library-error">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="private-library-message">
            {message}
          </div>
        )}

        <section
          className={
            dragActive
              ? "private-dropzone private-dropzone-active"
              : "private-dropzone"
          }
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();

            if (
              event.currentTarget ===
              event.target
            ) {
              setDragActive(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);

            uploadFiles(
              event.dataTransfer.files
            );
          }}
        >
          <div className="private-drop-icon">
            ↑
          </div>

          <div className="private-drop-copy">
            <strong>
              {t.private.dropTitle}
            </strong>

            <span>
              {t.private.dropHelp}
            </span>
          </div>

          <button
            type="button"
            className="private-choose-button"
            disabled={uploading}
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            {t.private.choosePhotos}
          </button>
        </section>

        <section className="private-library-content">
          <div className="private-library-toolbar">
            <div>
              <span>
                {t.private.yourPhotos}
              </span>

              <h2>
                {t.private.photoCollection}
              </h2>
            </div>

            <div className="private-photo-count">
              {photosLoading
                ? t.private.loading
                : `${photos.length} ${
                    photos.length === 1
                      ? t.private.photo
                      : t.private.photos
                  }`}
            </div>
          </div>

          {photosLoading && (
            <div className="private-gallery-state">
              {t.private.loadingPhotos}
            </div>
          )}

          {!photosLoading &&
            photos.length === 0 && (
              <div className="private-empty-gallery">
                <div className="private-empty-icon">
                  ▧
                </div>

                <h3>
                  {t.private.emptyTitle}
                </h3>

                <p>
                  {t.private.emptyText}
                </p>

                <button
                  type="button"
                  className="private-upload-button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  ＋ {t.private.uploadFirst}
                </button>
              </div>
            )}

          {!photosLoading &&
            photos.length > 0 && (
              <div className="private-photo-grid">
                {photos.map((photo) => (
                  <article
                    className="private-photo-card"
                    key={photo.id}
                  >
                    <div className="private-photo-preview">
                      {previewUrls[
                        photo.id
                      ] ? (
                        <img
                          src={
                            previewUrls[
                              photo.id
                            ]
                          }
                          alt={
                            photo.filename
                          }
                          loading="lazy"
                        />
                      ) : (
                        <div className="private-preview-loading">
                          Loading preview...
                        </div>
                      )}
                    </div>

                    <div className="private-photo-info">
                      <div className="private-photo-name">
                        <strong
                          title={
                            photo.filename
                          }
                        >
                          {photo.filename}
                        </strong>

                        <span>
                          {formatBytes(
                            photo.size
                          )}
                        </span>
                      </div>

                      <span className="private-photo-date">
                        {formatDate(
                          photo.uploadedAt
                        )}
                      </span>

                      <div className="private-photo-actions">
                        {previewUrls[
                          photo.id
                        ] && (
                          <button
                            type="button"
                            className="private-view-button"
                            onClick={() =>
                              openPreview(photo)
                            }
                          >
                            View
                          </button>
                        )}

                        <button
                          type="button"
                          className="private-edit-button"
                          onClick={() =>
                            openEditPhoto(photo)
                          }
                        >
                          ✎ {t.private.edit}
                        </button>

                        <button
                          type="button"
                          className="private-download-button"
                          onClick={() =>
                            downloadPhoto(
                              photo
                            )
                          }
                        >
                          ↓ Download
                        </button>

                        <button
                          type="button"
                          className="private-delete-button"
                          onClick={() => {
                            setDeletingPhoto(photo);
                            setEditingPhoto(null);
                            setError("");
                          }}
                        >
                          {t.private.delete}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </section>



        {previewPhoto &&
          previewUrls[previewPhoto.id] && (
            <div
              className="private-image-viewer-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (
                  event.currentTarget ===
                  event.target
                ) {
                  closePreview();
                }
              }}
            >
              <section
                className="private-image-viewer"
                role="dialog"
                aria-modal="true"
                aria-label={t.private.preview}
              >
                <header className="private-viewer-header">
                  <div>
                    <span>
                      PHOTO PREVIEW
                    </span>

                    <strong>
                      {getDisplayFilename(
                        previewPhoto.filename
                      )}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="private-viewer-close"
                    aria-label={t.private.closePreview}
                    onClick={closePreview}
                  >
                    ×
                  </button>
                </header>

                <div className="private-viewer-stage">

                  {photos.length > 1 && (
                    <button
                      type="button"
                      className="private-viewer-nav private-viewer-prev"
                      aria-label={t.private.previousPhoto}
                      onClick={() =>
                        movePreview(-1)
                      }
                    >
                      ‹
                    </button>
                  )}

                  <img
                    src={
                      previewUrls[
                        previewPhoto.id
                      ]
                    }
                    alt={
                      previewPhoto.filename
                    }
                  />

                  {photos.length > 1 && (
                    <button
                      type="button"
                      className="private-viewer-nav private-viewer-next"
                      aria-label={t.private.nextPhoto}
                      onClick={() =>
                        movePreview(1)
                      }
                    >
                      ›
                    </button>
                  )}

                </div>

                <footer className="private-viewer-footer">

                  <div className="private-viewer-meta">
                    <div>
                      <span>FILE SIZE</span>
                      <strong>
                        {formatBytes(
                          previewPhoto.size
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>UPLOADED</span>
                      <strong>
                        {formatDate(
                          previewPhoto.uploadedAt
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>POSITION</span>
                      <strong>
                        {photos.findIndex(
                          (photo) =>
                            photo.id ===
                            previewPhoto.id
                        ) + 1}
                        {" / "}
                        {photos.length}
                      </strong>
                    </div>
                  </div>

                  <div className="private-viewer-actions">
                    <button
                      type="button"
                      className="private-viewer-edit"
                      onClick={() => {
                        closePreview();
                        openEditPhoto(
                          previewPhoto
                        );
                      }}
                    >
                      ✎ {t.private.edit}
                    </button>

                    <button
                      type="button"
                      className="private-viewer-download"
                      onClick={() =>
                        downloadPhoto(
                          previewPhoto
                        )
                      }
                    >
                      ↓ Download
                    </button>
                  </div>

                </footer>

                <div className="private-viewer-hint">
                  {t.private.viewerHint}
                </div>

              </section>
            </div>
          )}

        {editingPhoto && (
          <div
            className="private-photo-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.currentTarget ===
                event.target &&
                !photoActionLoading
              ) {
                setEditingPhoto(null);
              }
            }}
          >
            <section
              className="private-photo-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-photo-title"
            >
              <div className="private-modal-icon">
                ✎
              </div>

              <span className="private-modal-eyebrow">
                EDIT PHOTO
              </span>

              <h2 id="edit-photo-title">
                {t.private.renamePhoto}
              </h2>

              <p>
                Give this image a short,
                descriptive filename. Its
                image format will remain
                unchanged.
              </p>

              <label
                className="private-edit-label"
                htmlFor="private-photo-name"
              >
                {t.private.photoName}
              </label>

              <input
                id="private-photo-name"
                className="private-edit-input"
                type="text"
                value={editName}
                maxLength={120}
                autoFocus
                onChange={(event) =>
                  setEditName(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !photoActionLoading
                  ) {
                    renamePhoto();
                  }

                  if (
                    event.key === "Escape" &&
                    !photoActionLoading
                  ) {
                    setEditingPhoto(null);
                  }
                }}
              />

              <div className="private-modal-actions">
                <button
                  type="button"
                  className="private-modal-cancel"
                  disabled={photoActionLoading}
                  onClick={() =>
                    setEditingPhoto(null)
                  }
                >
                  {t.private.cancel}
                </button>

                <button
                  type="button"
                  className="private-modal-save"
                  disabled={photoActionLoading}
                  onClick={renamePhoto}
                >
                  {photoActionLoading
                    ? t.private.saving
                    : t.private.saveChanges}
                </button>
              </div>
            </section>
          </div>
        )}

        {deletingPhoto && (
          <div
            className="private-photo-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.currentTarget ===
                event.target &&
                !photoActionLoading
              ) {
                setDeletingPhoto(null);
              }
            }}
          >
            <section
              className="private-photo-modal private-delete-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-photo-title"
            >
              <div className="private-modal-icon private-modal-danger-icon">
                !
              </div>

              <span className="private-modal-eyebrow private-danger-eyebrow">
                DELETE PHOTO
              </span>

              <h2 id="delete-photo-title">
                {t.private.deletePhotoTitle}
              </h2>

              <p>
                <strong>
                  {deletingPhoto.filename}
                </strong>
                {" "}
                {t.private.deleteDescription}
              </p>

              <div className="private-modal-actions">
                <button
                  type="button"
                  className="private-modal-cancel"
                  disabled={photoActionLoading}
                  onClick={() =>
                    setDeletingPhoto(null)
                  }
                >
                  {t.private.keepPhoto}
                </button>

                <button
                  type="button"
                  className="private-modal-delete"
                  disabled={photoActionLoading}
                  onClick={deletePhoto}
                >
                  {photoActionLoading
                    ? t.private.deleting
                    : t.private.deletePermanently}
                </button>
              </div>
            </section>
          </div>
        )}

      </section>
    </main>
  );
};

export default Private;
