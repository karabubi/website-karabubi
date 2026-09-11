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
      credentials: "include",
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
  const documentInputRef = useRef(null);

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

  const [documents, setDocuments] =
    useState([]);

  const [documentsLoading, setDocumentsLoading] =
    useState(true);

  const [documentsUploading, setDocumentsUploading] =
    useState(false);

  const [deletingDocument, setDeletingDocument] =
    useState(null);

  const [editingDocument, setEditingDocument] =
    useState(null);

  const [documentRenameValue, setDocumentRenameValue] =
    useState("");

  const [documentActionLoading, setDocumentActionLoading] =
    useState(false);

  const loadDocuments = useCallback(
    async () => {
      setDocumentsLoading(true);

      try {
        const response =
          await privateFetch(
            "/private/documents"
          );

        const body =
          await response.json();

        setDocuments(body.documents || []);
      } catch (err) {
        setError(
          err.message ||
          t.private.documentLoadError
        );
      } finally {
        setDocumentsLoading(false);
      }
    },
    []
  );

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
    loadDocuments();
  }, [
    isAuthenticated,
    loadPhotos,
    loadDocuments,
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

  async function uploadDocuments(files) {
    const selected =
      Array.from(files || []);

    if (!selected.length) {
      return;
    }

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".csv",
      ".txt",
    ];

    const invalid = selected.find((file) => {
      const name =
        file.name.toLowerCase();

      return !allowedExtensions.some(
        (extension) =>
          name.endsWith(extension)
      );
    });

    if (invalid) {
      setError(
        t.private.invalidDocumentType
      );
      return;
    }

    const tooLarge =
      selected.find(
        (file) =>
          file.size >
          20 * 1024 * 1024
      );

    if (tooLarge) {
      setError(
        `${tooLarge.name} ${t.private.documentTooLarge}`
      );
      return;
    }

    const formData =
      new FormData();

    selected.forEach((file) => {
      formData.append(
        "documents",
        file
      );
    });

    setDocumentsUploading(true);
    setError("");

    try {
      const response =
        await privateFetch(
          "/private/documents",
          {
            method: "POST",
            body: formData,
          }
        );

      const body =
        await response.json();

      setMessage(
        body.message ||
        t.private.documentUploadSuccess
      );

      await loadDocuments();
    } catch (err) {
      setError(
        err.message ||
        t.private.documentUploadError
      );
    } finally {
      setDocumentsUploading(false);

      if (documentInputRef.current) {
        documentInputRef.current.value = "";
      }
    }
  }

  async function downloadDocument(documentFile) {
    try {
      const response =
        await privateFetch(
          documentFile.downloadUrl
        );

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      const anchor =
        window.document.createElement("a");

      anchor.href = url;
      anchor.download =
        documentFile.filename ||
        "document";

      window.document.body.appendChild(
        anchor
      );

      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.message ||
        t.private.documentDownloadError
      );
    }
  }

  function openDocumentRename(documentFile) {
    setEditingDocument(documentFile);
    setDocumentRenameValue(documentFile.filename || "");
    setDeletingDocument(null);
    setError("");
  }

  function closeDocumentRename() {
    if (documentActionLoading) {
      return;
    }

    setEditingDocument(null);
    setDocumentRenameValue("");
  }

  async function renameDocument() {
    if (!editingDocument) {
      return;
    }

    const nextName =
      documentRenameValue.trim();

    if (!nextName) {
      setError(
        t.private.documentNameRequired
      );
      return;
    }

    const currentExtension =
      editingDocument.filename
        .slice(
          editingDocument.filename.lastIndexOf(".")
        )
        .toLowerCase();

    const nextExtension =
      nextName.includes(".")
        ? nextName
            .slice(nextName.lastIndexOf("."))
            .toLowerCase()
        : "";

    if (
      !currentExtension ||
      nextExtension !== currentExtension
    ) {
      setError(
        t.private.documentExtensionLocked
      );
      return;
    }

    setDocumentActionLoading(true);
    setError("");

    try {
      const response =
        await privateFetch(
          `/private/documents/${encodeURIComponent(
            editingDocument.storedFilename
          )}/rename`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filename: nextName,
            }),
          }
        );

      const body =
        await response.json();

      setMessage(
        body.message ||
        t.private.documentRenameSuccess
      );

      setEditingDocument(null);
      setDocumentRenameValue("");

      await loadDocuments();
    } catch (err) {
      setError(
        err.message ||
        t.private.documentRenameError
      );
    } finally {
      setDocumentActionLoading(false);
    }
  }

  async function deleteDocument() {
    if (!deletingDocument) {
      return;
    }

    setDocumentActionLoading(true);
    setError("");

    try {
      const response =
        await privateFetch(
          `/private/documents/${encodeURIComponent(
            deletingDocument.storedFilename
          )}`,
          {
            method: "DELETE",
          }
        );

      const body =
        await response.json();

      setMessage(
        body.message ||
        "Document deleted successfully."
      );

      setDeletingDocument(null);

      await loadDocuments();
    } catch (err) {
      setError(
        err.message ||
        t.private.documentDeleteError
      );
    } finally {
      setDocumentActionLoading(false);
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
      <main className="min-h-[calc(100vh-88px)] px-7 pb-[100px] pt-[66px] text-[#f8fafc] max-[650px]:px-[18px] max-[650px]:pb-[75px] max-[650px]:pt-12">
        <div className="mx-auto my-[70px] flex min-h-[240px] w-[min(600px,calc(100%-40px))] items-center justify-center rounded-[20px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.45)] text-[#71839a]">
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
    <main className="min-h-[calc(100vh-88px)] px-7 pb-[100px] pt-[66px] text-[#f8fafc] max-[650px]:px-[18px] max-[650px]:pb-[75px] max-[650px]:pt-12">
      <section className="mx-auto w-[min(1240px,100%)]">

        <header className="flex items-end justify-between gap-[35px] max-[950px]:flex-col max-[950px]:items-start [&>div:first-child]:max-w-[760px] [&_h1]:mb-[13px] [&_h1]:mt-[10px] [&_h1]:text-[clamp(2.5rem,5vw,4.5rem)] [&_h1]:font-inherit [&_h1]:leading-[1.03] [&_h1]:tracking-[-0.055em] [&_h1]:text-[#f8fafc] [&_p]:m-0 [&_p]:max-w-[700px] [&_p]:leading-[1.75] [&_p]:text-[#899ab0]">
          <div>
            <span className="text-[0.72rem] font-[850] tracking-[0.16em] text-[#60a5fa]">
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

          <div className="flex shrink-0 gap-[10px] max-[650px]:w-full max-[650px]:[&>button]:flex-1">
            <button
              type="button"
              className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[12px] text-[0.84rem] font-[750] no-underline transition-[transform,border-color,background] duration-[180ms] ease-[ease] px-[17px] border border-[#dbeafe] bg-[#f8fafc] text-[#08111f] hover:-translate-y-0.5 hover:bg-[#dbeafe] disabled:cursor-wait disabled:opacity-60"
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
              className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[12px] text-[0.84rem] font-[750] no-underline transition-[transform,border-color,background] duration-[180ms] ease-[ease] px-[17px] border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.62)] text-[#cbd5e1] hover:border-[rgba(96,165,250,0.45)]"
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

        <input
          ref={documentInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
          multiple
          hidden
          onChange={(event) =>
            uploadDocuments(
              event.target.files
            )
          }
        />

        {error && (
          <div className="mt-[25px] rounded-[12px] border border-[rgba(248,113,113,0.2)] bg-[rgba(127,29,29,0.16)] px-4 py-[13px] text-[0.82rem] text-[#fca5a5]">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="mt-[25px] rounded-[12px] border border-[rgba(96,165,250,0.16)] bg-[rgba(59,130,246,0.06)] px-4 py-[13px] text-[0.82rem] text-[#93b6e8]">
            {message}
          </div>
        )}

        <section
          className={
            `mt-9 flex min-h-[150px] items-center gap-5 rounded-[20px] border border-dashed p-7
            border-[rgba(96,165,250,0.28)]
            bg-[linear-gradient(145deg,rgba(15,25,44,0.66),rgba(6,13,27,0.72))]
            transition-[border-color,background,transform] duration-[180ms] ease-[ease]
            max-[650px]:flex-col max-[650px]:items-start
            ${
              dragActive
                ? "scale-[1.005] border-[#60a5fa] bg-[rgba(59,130,246,0.1)]"
                : ""
            }`
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
          <div className="grid h-[53px] w-[53px] shrink-0 basis-[53px] place-items-center rounded-[15px] border border-[rgba(96,165,250,0.18)] bg-[rgba(59,130,246,0.08)] text-[1.45rem] text-[#78adf4]">
            ↑
          </div>

          <div className="flex flex-col gap-[6px] [&>strong]:text-[0.96rem] [&>strong]:text-[#e2e8f0] [&>span]:text-[0.78rem] [&>span]:text-[#65778e]">
            <strong>
              {t.private.dropTitle}
            </strong>

            <span>
              {t.private.dropHelp}
            </span>
          </div>

          <button
            type="button"
            className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[12px] text-[0.84rem] font-[750] no-underline transition-[transform,border-color,background] duration-[180ms] ease-[ease] ml-auto px-4 border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.72)] text-[#cbd5e1] max-[650px]:ml-0 max-[650px]:w-full"
            disabled={uploading}
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            {t.private.choosePhotos}
          </button>
        </section>

        <section className="mt-7 rounded-3xl border border-[rgba(148,163,184,0.18)] bg-[linear-gradient(145deg,rgba(15,23,42,0.92),rgba(30,41,59,0.82))] p-7 shadow-[0_18px_45px_rgba(15,23,42,0.16)] max-[720px]:rounded-[20px] max-[720px]:px-4 max-[720px]:py-5">
          <div className="mb-[22px] flex items-end justify-between gap-5 max-[650px]:flex-col max-[650px]:items-start [&_span]:text-[0.67rem] [&_span]:font-[850] [&_span]:tracking-[0.14em] [&_span]:text-[#60a5fa] [&_h2]:mb-0 [&_h2]:mt-[5px] [&_h2]:text-[clamp(1.8rem,3vw,2.5rem)] [&_h2]:tracking-[-0.035em] [&_h2]:text-[#f8fafc]">
            <div>
              <span>
                {t.private.yourDocuments}
              </span>

              <h2>
                {t.private.documentCollection}
              </h2>
            </div>

            <div className="text-[0.78rem] text-[#687a91]">
              {documentsLoading
                ? t.private.loading
                : `${documents.length} ${
                    documents.length === 1
                      ? t.private.document
                      : t.private.documents
                  }`}
            </div>
          </div>

          <div className="my-[22px] flex items-center justify-between gap-[18px] rounded-[18px] bg-[rgba(15,23,42,0.34)] p-[18px] max-[720px]:flex-col max-[720px]:items-stretch">
            <button
              type="button"
              className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[12px] text-[0.84rem] font-[750] no-underline transition-[transform,border-color,background] duration-[180ms] ease-[ease] px-[17px] border border-[#dbeafe] bg-[#f8fafc] text-[#08111f] hover:-translate-y-0.5 hover:bg-[#dbeafe] disabled:cursor-wait disabled:opacity-60"
              disabled={documentsUploading}
              onClick={() =>
                documentInputRef.current?.click()
              }
            >
              <span>＋</span>
              {documentsUploading
                ? t.private.uploadingDocuments
                : t.private.uploadDocuments}
            </button>

            <span className="text-[0.84rem] leading-[1.5] text-[rgba(226,232,240,0.7)]">
              {t.private.documentHelp}
            </span>
          </div>

          {documentsLoading && (
            <div className="flex min-h-[240px] items-center justify-center rounded-[20px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.45)] text-[#71839a]">
              {t.private.loadingDocuments}
            </div>
          )}

          {!documentsLoading &&
            documents.length === 0 && (
              <div className="flex min-h-[330px] flex-col items-center justify-center rounded-[20px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.45)] p-[35px] text-center text-[#71839a] [&>h3]:m-0 [&>h3]:text-[1.25rem] [&>h3]:text-[#e2e8f0] [&>p]:mb-[21px] [&>p]:mt-[9px] [&>p]:max-w-[430px] [&>p]:text-[0.82rem] [&>p]:leading-[1.65] [&>p]:text-[#6e8097]">
                <div className="mb-[17px] grid h-[54px] w-[54px] place-items-center rounded-[15px] border border-[rgba(96,165,250,0.16)] bg-[rgba(59,130,246,0.06)] text-[1.4rem] text-[#6fa5ed]">
                  ▤
                </div>

                <h3>
                  {t.private.noDocumentsTitle}
                </h3>

                <p>
                  {t.private.noDocumentsText}
                </p>

                <button
                  type="button"
                  className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[12px] text-[0.84rem] font-[750] no-underline transition-[transform,border-color,background] duration-[180ms] ease-[ease] px-[17px] border border-[#dbeafe] bg-[#f8fafc] text-[#08111f] hover:-translate-y-0.5 hover:bg-[#dbeafe] disabled:cursor-wait disabled:opacity-60"
                  onClick={() =>
                    documentInputRef.current?.click()
                  }
                >
                  ＋ {t.private.uploadFirstDocument}
                </button>
              </div>
            )}

          {!documentsLoading &&
            documents.length > 0 && (
              <div className="mt-[18px] grid gap-3">
                {documents.map(
                  (documentFile) => (
                    <article
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-[17px] border border-[rgba(148,163,184,0.16)] bg-[rgba(15,23,42,0.48)] px-[18px] py-4 transition-[transform,border-color,background] duration-[160ms] ease-[ease] hover:-translate-y-px hover:border-[rgba(96,165,250,0.34)] hover:bg-[rgba(15,23,42,0.62)] max-[720px]:grid-cols-[auto_minmax(0,1fr)] max-[480px]:p-[14px] rtl:[direction:rtl]"
                      key={documentFile.id}
                    >
                      <div className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] bg-[rgba(59,130,246,0.14)] text-[1.35rem] text-[#93c5fd]">
                        ▤
                      </div>

                      <div className="flex min-w-0 flex-col gap-[5px] rtl:text-right [&>strong]:overflow-hidden [&>strong]:text-ellipsis [&>strong]:whitespace-nowrap [&>strong]:text-[0.96rem] [&>strong]:text-[#f8fafc] [&>span]:text-[0.78rem] [&>span]:text-[rgba(203,213,225,0.68)]">
                        <strong>
                          {documentFile.filename}
                        </strong>

                        <span>
                          {formatBytes(
                            documentFile.size
                          )}
                          {" · "}
                          {formatDate(
                            documentFile.updatedAt ||
                            documentFile.uploadedAt
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 max-[720px]:col-span-full max-[720px]:justify-end max-[480px]:flex-col max-[480px]:items-stretch [&>button]:min-h-[38px] [&>button]:cursor-pointer [&>button]:rounded-[10px] [&>button]:border [&>button]:border-[rgba(148,163,184,0.2)] [&>button]:bg-[rgba(30,41,59,0.76)] [&>button]:px-3 [&>button]:py-2 [&>button]:text-[0.8rem] [&>button]:font-bold [&>button]:text-[#e2e8f0] [&>button]:transition-[background,border-color,transform] [&>button]:duration-[160ms] [&>button]:ease-[ease] [&>button:hover]:-translate-y-px [&>button:hover]:border-[rgba(96,165,250,0.42)] [&>button:hover]:bg-[rgba(51,65,85,0.9)] max-[480px]:[&>button]:w-full">
                        <button
                          type="button"
                          className="!border-[rgba(96,165,250,0.26)] !text-[#93c5fd] hover:!border-[rgba(96,165,250,0.5)] hover:!bg-[rgba(30,64,175,0.16)]"
                          onClick={() =>
                            openDocumentRename(
                              documentFile
                            )
                          }
                        >
                          ✎ {t.private.renameDocument}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            downloadDocument(
                              documentFile
                            )
                          }
                        >
                          {t.private.downloadDocument}
                        </button>

                        <button
                          type="button"
                          className="!border-[rgba(248,113,113,0.2)] !text-[#fca5a5] hover:!border-[rgba(248,113,113,0.42)] hover:!bg-[rgba(127,29,29,0.22)]"
                          onClick={() =>
                            setDeletingDocument(
                              documentFile
                            )
                          }
                        >
                          {t.private.deleteDocument}
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
        </section>

        <section className="mt-[65px]">
          <div className="mb-[22px] flex items-end justify-between gap-5 max-[650px]:flex-col max-[650px]:items-start [&_span]:text-[0.67rem] [&_span]:font-[850] [&_span]:tracking-[0.14em] [&_span]:text-[#60a5fa] [&_h2]:mb-0 [&_h2]:mt-[5px] [&_h2]:text-[clamp(1.8rem,3vw,2.5rem)] [&_h2]:tracking-[-0.035em] [&_h2]:text-[#f8fafc]">
            <div>
              <span>
                {t.private.yourPhotos}
              </span>

              <h2>
                {t.private.photoCollection}
              </h2>
            </div>

            <div className="text-[0.78rem] text-[#687a91]">
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
            <div className="flex min-h-[240px] items-center justify-center rounded-[20px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.45)] text-[#71839a]">
              {t.private.loadingPhotos}
            </div>
          )}

          {!photosLoading &&
            photos.length === 0 && (
              <div className="flex min-h-[330px] flex-col items-center justify-center rounded-[20px] border border-[rgba(148,163,184,0.12)] bg-[rgba(15,23,42,0.45)] p-[35px] text-center text-[#71839a] [&>h3]:m-0 [&>h3]:text-[1.25rem] [&>h3]:text-[#e2e8f0] [&>p]:mb-[21px] [&>p]:mt-[9px] [&>p]:max-w-[430px] [&>p]:text-[0.82rem] [&>p]:leading-[1.65] [&>p]:text-[#6e8097]">
                <div className="mb-[17px] grid h-[54px] w-[54px] place-items-center rounded-[15px] border border-[rgba(96,165,250,0.16)] bg-[rgba(59,130,246,0.06)] text-[1.4rem] text-[#6fa5ed]">
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
                  className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[12px] text-[0.84rem] font-[750] no-underline transition-[transform,border-color,background] duration-[180ms] ease-[ease] px-[17px] border border-[#dbeafe] bg-[#f8fafc] text-[#08111f] hover:-translate-y-0.5 hover:bg-[#dbeafe] disabled:cursor-wait disabled:opacity-60"
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
              <div className="grid grid-cols-3 gap-4 max-[950px]:grid-cols-2 max-[650px]:grid-cols-1">
                {photos.map((photo) => (
                  <article
                    className="group overflow-hidden rounded-[18px] border border-[rgba(148,163,184,0.13)] bg-[linear-gradient(145deg,rgba(15,25,44,0.82),rgba(6,13,27,0.9))] shadow-[0_18px_45px_rgba(0,0,0,0.14)] transition-[transform,border-color] duration-200 ease-[ease] hover:-translate-y-1 hover:border-[rgba(96,165,250,0.35)]"
                    key={photo.id}
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-[#07101e] [&>img]:block [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:transition-transform [&>img]:duration-300 [&>img]:ease-[ease] group-hover:[&>img]:scale-[1.025]">
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
                        <div className="grid h-full w-full place-items-center text-[0.74rem] text-[#53657b]">
                          Loading preview...
                        </div>
                      )}
                    </div>

                    <div className="p-[17px]">
                      <div className="flex items-start justify-between gap-[14px] [&>strong]:min-w-0 [&>strong]:overflow-hidden [&>strong]:text-ellipsis [&>strong]:whitespace-nowrap [&>strong]:text-[0.85rem] [&>strong]:text-[#dce6f2] [&>span]:shrink-0 [&>span]:text-[0.68rem] [&>span]:text-[#607188]">
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

                      <span className="mt-[7px] block text-[0.68rem] text-[#52647a]">
                        {formatDate(
                          photo.uploadedAt
                        )}
                      </span>

                      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[rgba(148,163,184,0.08)] pt-[14px] max-[650px]:grid-cols-1 max-[620px]:grid-cols-2">
                        {previewUrls[
                          photo.id
                        ] && (
                          <button
                            type="button"
                            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[11px] text-[0.76rem] font-[750] transition-[transform,border-color,background] duration-[180ms] ease-[ease] gap-2 px-3 border border-[rgba(148,163,184,0.16)] bg-[rgba(15,23,42,0.6)] text-[#aab9cc]"
                            onClick={() =>
                              openPreview(photo)
                            }
                          >
                            View
                          </button>
                        )}

                        <button
                          type="button"
                          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[11px] text-[0.76rem] font-[750] transition-[transform,border-color,background] duration-[180ms] ease-[ease] border border-[rgba(96,165,250,0.18)] bg-[rgba(59,130,246,0.06)] text-[#9cc3fa] hover:-translate-y-px hover:border-[rgba(96,165,250,0.42)]"
                          onClick={() =>
                            openEditPhoto(photo)
                          }
                        >
                          ✎ {t.private.edit}
                        </button>

                        <button
                          type="button"
                          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[11px] text-[0.76rem] font-[750] transition-[transform,border-color,background] duration-[180ms] ease-[ease] gap-2 px-3 border border-[rgba(96,165,250,0.22)] bg-[rgba(59,130,246,0.08)] text-[#8fbaff]"
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
                          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[11px] text-[0.76rem] font-[750] transition-[transform,border-color,background] duration-[180ms] ease-[ease] border border-[rgba(248,113,113,0.18)] bg-[rgba(127,29,29,0.08)] text-[#fca5a5] hover:-translate-y-px hover:border-[rgba(248,113,113,0.42)] hover:bg-[rgba(127,29,29,0.16)]"
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
              className="fixed inset-0 z-[2100] grid place-items-center bg-[rgba(2,6,23,0.9)] p-[22px] backdrop-blur-[12px] overscroll-contain max-[700px]:p-[10px]"
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
                className="isolate flex max-h-[94vh] w-[min(1180px,96vw)] flex-col overflow-hidden rounded-[22px] border border-[rgba(148,163,184,0.17)] bg-[#07101e] shadow-[0_40px_120px_rgba(0,0,0,0.6)] max-[700px]:max-h-[96vh] max-[700px]:w-full max-[700px]:rounded-2xl"
                role="dialog"
                aria-modal="true"
                aria-label={t.private.preview}
              >
                <header className="flex min-h-[76px] items-center justify-between gap-5 border-b border-[rgba(148,163,184,0.1)] py-[15px] pl-6 pr-5 max-[620px]:px-[14px] max-[620px]:py-[13px] [&>div]:min-w-0 [&>div>span]:mb-1 [&>div>span]:block [&>div>span]:text-[0.62rem] [&>div>span]:font-[850] [&>div>span]:tracking-[0.14em] [&>div>span]:text-[#60a5fa] [&>div>strong]:block [&>div>strong]:overflow-hidden [&>div>strong]:text-ellipsis [&>div>strong]:whitespace-nowrap [&>div>strong]:text-[0.88rem] [&>div>strong]:text-[#e8eef7]">
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
                    className="h-[43px] w-[43px] shrink-0 cursor-pointer rounded-xl border border-[rgba(148,163,184,0.16)] bg-[rgba(15,23,42,0.7)] text-[1.55rem] text-[#bac8da]"
                    aria-label={t.private.closePreview}
                    onClick={closePreview}
                  >
                    ×
                  </button>
                </header>

                <div className="relative grid min-h-[300px] flex-1 place-items-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.42),rgba(2,6,23,0.82))] [&>img]:block [&>img]:max-h-[min(68vh,740px)] [&>img]:max-w-full [&>img]:select-none [&>img]:object-contain [&>img]:[-webkit-user-drag:none]">

                  {photos.length > 1 && (
                    <button
                      type="button"
                      className="absolute left-[18px] top-1/2 z-[2] grid h-[62px] w-12 -translate-y-1/2 cursor-pointer place-items-center rounded-[14px] border border-[rgba(148,163,184,0.18)] bg-[rgba(2,6,23,0.72)] text-[2.2rem] text-[#e8eef7] backdrop-blur-[7px] hover:border-[rgba(96,165,250,0.55)] hover:bg-[rgba(15,23,42,0.88)] max-[700px]:left-2 max-[700px]:h-[52px] max-[700px]:w-10"
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
                      className="absolute right-[18px] top-1/2 z-[2] grid h-[62px] w-12 -translate-y-1/2 cursor-pointer place-items-center rounded-[14px] border border-[rgba(148,163,184,0.18)] bg-[rgba(2,6,23,0.72)] text-[2.2rem] text-[#e8eef7] backdrop-blur-[7px] hover:border-[rgba(96,165,250,0.55)] hover:bg-[rgba(15,23,42,0.88)] max-[700px]:right-2 max-[700px]:h-[52px] max-[700px]:w-10"
                      aria-label={t.private.nextPhoto}
                      onClick={() =>
                        movePreview(1)
                      }
                    >
                      ›
                    </button>
                  )}

                </div>

                <footer className="flex items-center justify-between gap-6 border-t border-[rgba(148,163,184,0.1)] px-6 py-[17px] max-[700px]:flex-col max-[700px]:items-start max-[620px]:p-[14px]">

                  <div className="flex gap-[30px] max-[700px]:w-full max-[700px]:flex-wrap max-[700px]:gap-x-6 max-[700px]:gap-y-[15px] max-[620px]:grid max-[620px]:grid-cols-2 [&>div]:flex [&>div]:flex-col [&>div]:gap-[3px] [&>div>span]:text-[0.58rem] [&>div>span]:font-[850] [&>div>span]:tracking-[0.11em] [&>div>span]:text-[#51637a] [&>div>strong]:text-[0.72rem] [&>div>strong]:text-[#aebdd0]">
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

                  <div className="flex gap-2 max-[700px]:w-full max-[700px]:[&>button]:flex-1">
                    <button
                      type="button"
                      className="min-h-[42px] cursor-pointer rounded-[11px] border border-[rgba(148,163,184,0.17)] bg-[rgba(15,23,42,0.7)] px-[15px] text-[0.75rem] font-[780] text-[#b9c8da]"
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
                      className="min-h-[42px] cursor-pointer rounded-[11px] border border-[rgba(96,165,250,0.28)] bg-[rgba(59,130,246,0.1)] px-[15px] text-[0.75rem] font-[780] text-[#8ebcff]"
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

                <div className="px-6 pb-[13px] text-center text-[0.62rem] text-[#45576d] max-[620px]:pb-[10px]">
                  {t.private.viewerHint}
                </div>

              </section>
            </div>
          )}

        {editingPhoto && (
          <div
            className="fixed inset-0 z-[2000] grid place-items-center bg-[rgba(2,6,23,0.78)] p-6 backdrop-blur-[9px]"
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
              className="w-[min(500px,100%)] rounded-[22px] border border-[rgba(148,163,184,0.17)] bg-[linear-gradient(145deg,#101827,#080f1e)] p-7 shadow-[0_35px_100px_rgba(0,0,0,0.5)] [&>h2]:mb-[10px] [&>h2]:mt-[7px] [&>h2]:text-[1.75rem] [&>h2]:tracking-[-0.035em] [&>h2]:text-[#f8fafc] [&>p]:m-0 [&>p]:text-[0.83rem] [&>p]:leading-[1.7] [&>p]:text-[#8293aa] [&>p>strong]:text-[#dce6f2]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-photo-title"
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-[14px] border border-[rgba(96,165,250,0.18)] bg-[rgba(59,130,246,0.08)] text-[1.2rem] font-[850] text-[#8bbcff]">
                ✎
              </div>

              <span className="text-[0.64rem] font-[850] tracking-[0.15em] text-[#60a5fa]">
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
                className="mb-2 mt-6 block text-[0.74rem] font-[750] text-[#a9b8cb]"
                htmlFor="private-photo-name"
              >
                {t.private.photoName}
              </label>

              <input
                id="private-photo-name"
                className="min-h-[49px] w-full rounded-[11px] border border-[rgba(96,165,250,0.24)] bg-[#0c1628] px-[14px] text-[0.86rem] text-[#eef4fc] outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.11)]"
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

              <div className="mt-[25px] flex justify-end gap-[9px] max-[650px]:flex-col-reverse max-[650px]:[&>button]:w-full">
                <button
                  type="button"
                  className="min-h-11 cursor-pointer rounded-[11px] border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.72)] px-4 text-[0.79rem] font-[780] text-[#b6c3d3] disabled:cursor-wait disabled:opacity-55"
                  disabled={photoActionLoading}
                  onClick={() =>
                    setEditingPhoto(null)
                  }
                >
                  {t.private.cancel}
                </button>

                <button
                  type="button"
                  className="min-h-[42px] cursor-pointer rounded-[11px] border border-[rgba(96,165,250,0.4)] bg-[rgba(37,99,235,0.18)] px-4 py-[9px] text-[0.79rem] font-bold text-[#bfdbfe] hover:not-disabled:bg-[rgba(37,99,235,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
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

        {editingDocument && (
          <div
            className="fixed inset-0 z-[2000] grid place-items-center bg-[rgba(2,6,23,0.78)] p-6 backdrop-blur-[9px]"
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.currentTarget === event.target &&
                !documentActionLoading
              ) {
                closeDocumentRename();
              }
            }}
          >
            <section
              className="w-[min(500px,100%)] rounded-[22px] border border-[rgba(148,163,184,0.17)] bg-[linear-gradient(145deg,#101827,#080f1e)] p-7 shadow-[0_35px_100px_rgba(0,0,0,0.5)] [&>h2]:mb-[10px] [&>h2]:mt-[7px] [&>h2]:text-[1.75rem] [&>h2]:tracking-[-0.035em] [&>h2]:text-[#f8fafc] [&>p]:m-0 [&>p]:text-[0.83rem] [&>p]:leading-[1.7] [&>p]:text-[#8293aa] [&>p>strong]:text-[#dce6f2] max-w-[560px] max-[480px]:w-[calc(100vw-28px)]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="rename-document-title"
            >
              <span className="text-[0.64rem] font-[850] tracking-[0.15em] text-[#60a5fa]">
                {t.private.renameDocument}
              </span>

              <h2 id="rename-document-title">
                {t.private.renameDocumentTitle}
              </h2>

              <p className="mb-5 mt-2 leading-[1.6] text-[rgba(203,213,225,0.72)]">
                {t.private.renameDocumentHelp}
              </p>

              <label className="mt-[18px] flex flex-col gap-2 rtl:text-right [&>span]:text-[0.82rem] [&>span]:font-bold [&>span]:text-[#cbd5e1] [&>input]:min-h-[46px] [&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-[rgba(148,163,184,0.24)] [&>input]:bg-[rgba(15,23,42,0.72)] [&>input]:px-[13px] [&>input]:py-[10px] [&>input]:text-[#f8fafc] [&>input]:outline-none [&>input]:transition-[border-color,box-shadow,background] [&>input]:duration-[160ms] [&>input]:ease-[ease] [&>input]:focus:border-[rgba(96,165,250,0.7)] [&>input]:focus:bg-[rgba(15,23,42,0.9)] [&>input]:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] [&>input]:disabled:cursor-not-allowed [&>input]:disabled:opacity-60 rtl:[&>input]:text-right max-[480px]:[&>input]:text-base">
                <span>
                  {t.private.documentName}
                </span>

                <input
                  type="text"
                  value={documentRenameValue}
                  disabled={documentActionLoading}
                  autoFocus
                  onChange={(event) =>
                    setDocumentRenameValue(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      renameDocument();
                    }

                    if (event.key === "Escape") {
                      closeDocumentRename();
                    }
                  }}
                />
              </label>

              <div className="mt-[25px] flex justify-end gap-[9px] max-[650px]:flex-col-reverse max-[650px]:[&>button]:w-full">
                <button
                  type="button"
                  className="min-h-11 cursor-pointer rounded-[11px] border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.72)] px-4 text-[0.79rem] font-[780] text-[#b6c3d3] disabled:cursor-wait disabled:opacity-55"
                  disabled={documentActionLoading}
                  onClick={closeDocumentRename}
                >
                  {t.private.cancel}
                </button>

                <button
                  type="button"
                  className="min-h-[42px] cursor-pointer rounded-[11px] border border-[rgba(96,165,250,0.4)] bg-[rgba(37,99,235,0.18)] px-4 py-[9px] text-[0.79rem] font-bold text-[#bfdbfe] hover:not-disabled:bg-[rgba(37,99,235,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={documentActionLoading}
                  onClick={renameDocument}
                >
                  {documentActionLoading
                    ? t.private.saving
                    : t.private.saveChanges}
                </button>
              </div>
            </section>
          </div>
        )}

        {deletingDocument && (
          <div
            className="fixed inset-0 z-[2000] grid place-items-center bg-[rgba(2,6,23,0.78)] p-6 backdrop-blur-[9px]"
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.currentTarget ===
                  event.target &&
                !documentActionLoading
              ) {
                setDeletingDocument(null);
              }
            }}
          >
            <section
              className="w-[min(500px,100%)] rounded-[22px] border border-[rgba(148,163,184,0.17)] bg-[linear-gradient(145deg,#101827,#080f1e)] p-7 shadow-[0_35px_100px_rgba(0,0,0,0.5)] [&>h2]:mb-[10px] [&>h2]:mt-[7px] [&>h2]:text-[1.75rem] [&>h2]:tracking-[-0.035em] [&>h2]:text-[#f8fafc] [&>p]:m-0 [&>p]:text-[0.83rem] [&>p]:leading-[1.7] [&>p]:text-[#8293aa] [&>p>strong]:text-[#dce6f2]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-document-title"
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-[14px] border border-[rgba(248,113,113,0.22)] bg-[rgba(127,29,29,0.13)] text-[1.2rem] font-[850] text-[#fca5a5]">
                !
              </div>

              <span className="text-[0.64rem] font-[850] tracking-[0.15em] text-[#f87171]">
                {t.private.deleteDocumentEyebrow}
              </span>

              <h2 id="delete-document-title">
                {t.private.deleteDocumentTitle}
              </h2>

              <p>
                <strong>
                  {deletingDocument.filename}
                </strong>
                {" "}
                {t.private.deleteDocumentDescription}
              </p>

              <div className="mt-[25px] flex justify-end gap-[9px] max-[650px]:flex-col-reverse max-[650px]:[&>button]:w-full">
                <button
                  type="button"
                  className="min-h-11 cursor-pointer rounded-[11px] border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.72)] px-4 text-[0.79rem] font-[780] text-[#b6c3d3] disabled:cursor-wait disabled:opacity-55"
                  disabled={documentActionLoading}
                  onClick={() =>
                    setDeletingDocument(null)
                  }
                >
                  {t.private.keepDocument}
                </button>

                <button
                  type="button"
                  className="min-h-11 cursor-pointer rounded-[11px] border border-[rgba(248,113,113,0.35)] bg-[#7f1d1d] px-4 text-[0.79rem] font-[780] text-[#fee2e2] disabled:cursor-wait disabled:opacity-55"
                  disabled={documentActionLoading}
                  onClick={deleteDocument}
                >
                  {documentActionLoading
                    ? t.private.deleting
                    : t.private.deleteDocumentPermanently}
                </button>
              </div>
            </section>
          </div>
        )}

        {deletingPhoto && (
          <div
            className="fixed inset-0 z-[2000] grid place-items-center bg-[rgba(2,6,23,0.78)] p-6 backdrop-blur-[9px]"
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
              className="w-[min(500px,100%)] rounded-[22px] border border-[rgba(148,163,184,0.17)] bg-[linear-gradient(145deg,#101827,#080f1e)] p-7 shadow-[0_35px_100px_rgba(0,0,0,0.5)] [&>h2]:mb-[10px] [&>h2]:mt-[7px] [&>h2]:text-[1.75rem] [&>h2]:tracking-[-0.035em] [&>h2]:text-[#f8fafc] [&>p]:m-0 [&>p]:text-[0.83rem] [&>p]:leading-[1.7] [&>p]:text-[#8293aa] [&>p>strong]:text-[#dce6f2]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-photo-title"
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-[14px] border border-[rgba(248,113,113,0.22)] bg-[rgba(127,29,29,0.13)] text-[1.2rem] font-[850] text-[#fca5a5]">
                !
              </div>

              <span className="text-[0.64rem] font-[850] tracking-[0.15em] text-[#f87171]">
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

              <div className="mt-[25px] flex justify-end gap-[9px] max-[650px]:flex-col-reverse max-[650px]:[&>button]:w-full">
                <button
                  type="button"
                  className="min-h-11 cursor-pointer rounded-[11px] border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.72)] px-4 text-[0.79rem] font-[780] text-[#b6c3d3] disabled:cursor-wait disabled:opacity-55"
                  disabled={photoActionLoading}
                  onClick={() =>
                    setDeletingPhoto(null)
                  }
                >
                  {t.private.keepPhoto}
                </button>

                <button
                  type="button"
                  className="min-h-11 cursor-pointer rounded-[11px] border border-[rgba(248,113,113,0.35)] bg-[#7f1d1d] px-4 text-[0.79rem] font-[780] text-[#fee2e2] disabled:cursor-wait disabled:opacity-55"
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
