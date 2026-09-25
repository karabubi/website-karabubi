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

import {
  useLanguage,
} from "../context/LanguageContext";

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
  "image/gif",
];

const TEXT = {
  en: {
    checking:
      "Checking administrator access...",

    badge:
      "Administrator",

    title:
      "Manage Image Gallery",

    intro:
      "Upload, edit, replace and delete gallery images. Titles and descriptions can be entered in English, German and Arabic.",

    createTitle:
      "Upload New Image",

    editTitle:
      "Edit Gallery Image",

    titleEnglish:
      "Title (English)",

    titleGerman:
      "Title (German)",

    titleArabic:
      "Title (Arabic)",

    descriptionEnglish:
      "Description (English)",

    descriptionGerman:
      "Description (German)",

    descriptionArabic:
      "Description (Arabic)",

    titleEnPlaceholder:
      "Enter the English title",

    titleDePlaceholder:
      "Enter the German title",

    titleArPlaceholder:
      "اكتب العنوان باللغة العربية",

    descriptionEnPlaceholder:
      "Enter the English description",

    descriptionDePlaceholder:
      "Enter the German description",

    descriptionArPlaceholder:
      "اكتب الوصف باللغة العربية",

    imageFile:
      "Image file",

    imageHelp:
      "JPG, PNG, WEBP or GIF. Maximum size: 10 MB.",

    imageRequired:
      "Please choose an image file.",

    imageOptional:
      "Choose a new image only if you want to replace the current one.",

    currentImage:
      "Current image",

    newPreview:
      "New image preview",

    upload:
      "Upload Image",

    update:
      "Save Changes",

    saving:
      "Saving...",

    cancel:
      "Cancel",

    existing:
      "Gallery Images",

    loading:
      "Loading gallery images...",

    empty:
      "No gallery images have been uploaded yet.",

    edit:
      "Edit",

    delete:
      "Delete",

    deleting:
      "Deleting...",

    deleteConfirm:
      "Are you sure you want to delete this gallery image?",

    titleRequired:
      "The English title is required.",

    titleTooLong:
      "Titles must not exceed 200 characters.",

    descriptionTooLong:
      "Descriptions must not exceed 5000 characters.",

    invalidType:
      "Only JPG, PNG, WEBP and GIF images are allowed.",

    maxSize:
      "The image must not exceed 10 MB.",

    loadError:
      "Gallery images could not be loaded.",

    saveError:
      "The gallery image could not be saved.",

    deleteError:
      "The gallery image could not be deleted.",

    created:
      "Image uploaded successfully.",

    updated:
      "Image updated successfully.",

    deleted:
      "Image deleted successfully.",

    imageAlt:
      "Gallery image",
  },

  de: {
    checking:
      "Administratorzugriff wird geprüft...",

    badge:
      "Administrator",

    title:
      "Bildergalerie verwalten",

    intro:
      "Laden Sie Bilder hoch, bearbeiten, ersetzen oder löschen Sie sie. Titel und Beschreibungen können auf Englisch, Deutsch und Arabisch eingegeben werden.",

    createTitle:
      "Neues Bild hochladen",

    editTitle:
      "Galeriebild bearbeiten",

    titleEnglish:
      "Titel (Englisch)",

    titleGerman:
      "Titel (Deutsch)",

    titleArabic:
      "Titel (Arabisch)",

    descriptionEnglish:
      "Beschreibung (Englisch)",

    descriptionGerman:
      "Beschreibung (Deutsch)",

    descriptionArabic:
      "Beschreibung (Arabisch)",

    titleEnPlaceholder:
      "Englischen Titel eingeben",

    titleDePlaceholder:
      "Deutschen Titel eingeben",

    titleArPlaceholder:
      "اكتب العنوان باللغة العربية",

    descriptionEnPlaceholder:
      "Englische Beschreibung eingeben",

    descriptionDePlaceholder:
      "Deutsche Beschreibung eingeben",

    descriptionArPlaceholder:
      "اكتب الوصف باللغة العربية",

    imageFile:
      "Bilddatei",

    imageHelp:
      "JPG, PNG, WEBP oder GIF. Maximale Größe: 10 MB.",

    imageRequired:
      "Bitte wählen Sie eine Bilddatei aus.",

    imageOptional:
      "Wählen Sie nur dann ein neues Bild aus, wenn Sie das aktuelle Bild ersetzen möchten.",

    currentImage:
      "Aktuelles Bild",

    newPreview:
      "Vorschau des neuen Bildes",

    upload:
      "Bild hochladen",

    update:
      "Änderungen speichern",

    saving:
      "Wird gespeichert...",

    cancel:
      "Abbrechen",

    existing:
      "Galeriebilder",

    loading:
      "Galeriebilder werden geladen...",

    empty:
      "Es wurden noch keine Galeriebilder hochgeladen.",

    edit:
      "Bearbeiten",

    delete:
      "Löschen",

    deleting:
      "Wird gelöscht...",

    deleteConfirm:
      "Möchten Sie dieses Galeriebild wirklich löschen?",

    titleRequired:
      "Der englische Titel ist erforderlich.",

    titleTooLong:
      "Titel dürfen höchstens 200 Zeichen lang sein.",

    descriptionTooLong:
      "Beschreibungen dürfen höchstens 5000 Zeichen lang sein.",

    invalidType:
      "Nur JPG-, PNG-, WEBP- und GIF-Bilder sind erlaubt.",

    maxSize:
      "Das Bild darf höchstens 10 MB groß sein.",

    loadError:
      "Die Galeriebilder konnten nicht geladen werden.",

    saveError:
      "Das Galeriebild konnte nicht gespeichert werden.",

    deleteError:
      "Das Galeriebild konnte nicht gelöscht werden.",

    created:
      "Bild wurde erfolgreich hochgeladen.",

    updated:
      "Bild wurde erfolgreich aktualisiert.",

    deleted:
      "Bild wurde erfolgreich gelöscht.",

    imageAlt:
      "Galeriebild",
  },

  ar: {
    checking:
      "جارٍ التحقق من صلاحيات المسؤول...",

    badge:
      "المسؤول",

    title:
      "إدارة معرض الصور",

    intro:
      "يمكنك رفع الصور وتعديلها واستبدالها وحذفها، مع إضافة العناوين والأوصاف باللغات الإنجليزية والألمانية والعربية.",

    createTitle:
      "رفع صورة جديدة",

    editTitle:
      "تعديل صورة المعرض",

    titleEnglish:
      "العنوان (الإنجليزية)",

    titleGerman:
      "العنوان (الألمانية)",

    titleArabic:
      "العنوان (العربية)",

    descriptionEnglish:
      "الوصف (الإنجليزية)",

    descriptionGerman:
      "الوصف (الألمانية)",

    descriptionArabic:
      "الوصف (العربية)",

    titleEnPlaceholder:
      "Enter the English title",

    titleDePlaceholder:
      "Deutschen Titel eingeben",

    titleArPlaceholder:
      "اكتب العنوان باللغة العربية",

    descriptionEnPlaceholder:
      "Enter the English description",

    descriptionDePlaceholder:
      "Deutsche Beschreibung eingeben",

    descriptionArPlaceholder:
      "اكتب الوصف باللغة العربية",

    imageFile:
      "ملف الصورة",

    imageHelp:
      "JPG أو PNG أو WEBP أو GIF. الحد الأقصى للحجم: 10 ميغابايت.",

    imageRequired:
      "يرجى اختيار ملف صورة.",

    imageOptional:
      "اختر صورة جديدة فقط إذا كنت تريد استبدال الصورة الحالية.",

    currentImage:
      "الصورة الحالية",

    newPreview:
      "معاينة الصورة الجديدة",

    upload:
      "رفع الصورة",

    update:
      "حفظ التعديلات",

    saving:
      "جارٍ الحفظ...",

    cancel:
      "إلغاء",

    existing:
      "صور المعرض",

    loading:
      "جارٍ تحميل صور المعرض...",

    empty:
      "لم يتم رفع أي صور إلى المعرض حتى الآن.",

    edit:
      "تعديل",

    delete:
      "حذف",

    deleting:
      "جارٍ الحذف...",

    deleteConfirm:
      "هل أنت متأكد من أنك تريد حذف هذه الصورة؟",

    titleRequired:
      "العنوان باللغة الإنجليزية مطلوب.",

    titleTooLong:
      "يجب ألا يتجاوز العنوان 200 حرف.",

    descriptionTooLong:
      "يجب ألا يتجاوز الوصف 5000 حرف.",

    invalidType:
      "يُسمح فقط بصور JPG وPNG وWEBP وGIF.",

    maxSize:
      "يجب ألا يتجاوز حجم الصورة 10 ميغابايت.",

    loadError:
      "تعذر تحميل صور المعرض.",

    saveError:
      "تعذر حفظ صورة المعرض.",

    deleteError:
      "تعذر حذف صورة المعرض.",

    created:
      "تم رفع الصورة بنجاح.",

    updated:
      "تم تحديث الصورة بنجاح.",

    deleted:
      "تم حذف الصورة بنجاح.",

    imageAlt:
      "صورة من المعرض",
  },
};

function getImageUrl(
  imageUrl
) {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith(
      "http://"
    ) ||
    imageUrl.startsWith(
      "https://"
    )
  ) {
    return imageUrl;
  }

  return (
    `${API_URL}${imageUrl}`
  );
}

function getPreferredTitle(
  image,
  language
) {
  if (
    language === "de"
  ) {
    return (
      image.titleDe ||
      image.titleEn ||
      ""
    );
  }

  if (
    language === "ar"
  ) {
    return (
      image.titleAr ||
      image.titleEn ||
      ""
    );
  }

  return (
    image.titleEn ||
    ""
  );
}

async function galleryRequest(
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
      `${API_URL}/gallery${path}`,
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
      "Gallery request failed."
    );
  }

  return data;
}

function AdminGallery() {
  const {
    user,
    loading:
      authLoading,
  } = useAuth();

  const {
    language,
  } = useLanguage();

  const copy =
    TEXT[language] ||
    TEXT.en;

  const [
    images,
    setImages,
  ] = useState([]);

  const [
    titleEn,
    setTitleEn,
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
    descriptionEn,
    setDescriptionEn,
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
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const imageInputRef =
    useRef(null);

  const loadImages =
    useCallback(
      async () => {

        setLoading(
          true
        );

        setError(
          ""
        );

        try {

          const data =
            await galleryRequest(
              "/"
            );

          setImages(
            data.images ||
            []
          );

        } catch (
          requestError
        ) {

          setError(
            requestError.message ||
            copy.loadError
          );

        } finally {

          setLoading(
            false
          );
        }
      },
      []
    );

  useEffect(
    () => {

      if (
        !authLoading &&
        user?.role ===
          "admin"
      ) {
        loadImages();
      }

    },
    [
      authLoading,
      user,
      loadImages,
    ]
  );

  useEffect(
    () => {

      return () => {

        if (
          imagePreview &&
          imagePreview
            .startsWith(
              "blob:"
            )
        ) {
          URL
            .revokeObjectURL(
              imagePreview
            );
        }
      };

    },
    [
      imagePreview,
    ]
  );

  if (
    authLoading
  ) {
    return (
      <main className="min-h-[calc(100vh-86px)] bg-slate-950 px-6 py-16 text-center text-slate-300">
        {
          copy.checking
        }
      </main>
    );
  }

  if (
    user?.role !==
    "admin"
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const clearPreview =
    () => {

      if (
        imagePreview &&
        imagePreview
          .startsWith(
            "blob:"
          )
      ) {
        URL
          .revokeObjectURL(
            imagePreview
          );
      }

      setImagePreview(
        ""
      );
    };

  const resetForm =
    () => {

      clearPreview();

      setTitleEn(
        ""
      );

      setTitleDe(
        ""
      );

      setTitleAr(
        ""
      );

      setDescriptionEn(
        ""
      );

      setDescriptionDe(
        ""
      );

      setDescriptionAr(
        ""
      );

      setImageFile(
        null
      );

      setExistingImageUrl(
        ""
      );

      setEditingId(
        null
      );

      setError(
        ""
      );

      if (
        imageInputRef.current
      ) {
        imageInputRef
          .current
          .value =
          "";
      }
    };

  const handleImageChange =
    (event) => {

      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      setError(
        ""
      );

      setMessage(
        ""
      );

      if (
        !ALLOWED_IMAGE_TYPES
          .includes(
            file.type
          )
      ) {
        event.target.value =
          "";

        setError(
          copy.invalidType
        );

        return;
      }

      if (
        file.size >
        MAX_IMAGE_SIZE
      ) {
        event.target.value =
          "";

        setError(
          copy.maxSize
        );

        return;
      }

      clearPreview();

      const preview =
        URL
          .createObjectURL(
            file
          );

      setImageFile(
        file
      );

      setImagePreview(
        preview
      );
    };

  const handleEdit =
    (image) => {

      clearPreview();

      setEditingId(
        image.id
      );

      setTitleEn(
        image.titleEn ||
        ""
      );

      setTitleDe(
        image.titleDe ||
        ""
      );

      setTitleAr(
        image.titleAr ||
        ""
      );

      setDescriptionEn(
        image.descriptionEn ||
        ""
      );

      setDescriptionDe(
        image.descriptionDe ||
        ""
      );

      setDescriptionAr(
        image.descriptionAr ||
        ""
      );

      setImageFile(
        null
      );

      setExistingImageUrl(
        getImageUrl(
          image.imageUrl
        )
      );

      if (
        imageInputRef.current
      ) {
        imageInputRef
          .current
          .value =
          "";
      }

      setError(
        ""
      );

      setMessage(
        ""
      );

      window.scrollTo({
        top:
          0,

        behavior:
          "smooth",
      });
    };

  const validateForm =
    () => {

      const titles = [
        titleEn.trim(),
        titleDe.trim(),
        titleAr.trim(),
      ];

      const descriptions = [
        descriptionEn.trim(),
        descriptionDe.trim(),
        descriptionAr.trim(),
      ];

      if (
        !titles[0]
      ) {
        setError(
          copy.titleRequired
        );

        return false;
      }

      if (
        titles.some(
          (value) =>
            value.length >
            200
        )
      ) {
        setError(
          copy.titleTooLong
        );

        return false;
      }

      if (
        descriptions.some(
          (value) =>
            value.length >
            5000
        )
      ) {
        setError(
          copy.descriptionTooLong
        );

        return false;
      }

      if (
        !editingId &&
        !imageFile
      ) {
        setError(
          copy.imageRequired
        );

        return false;
      }

      return true;
    };

  const handleSubmit =
    async (
      event
    ) => {

      event
        .preventDefault();

      setError(
        ""
      );

      setMessage(
        ""
      );

      if (
        !validateForm()
      ) {
        return;
      }

      setSaving(
        true
      );

      try {

        const formData =
          new FormData();

        formData.append(
          "titleEn",
          titleEn.trim()
        );

        formData.append(
          "titleDe",
          titleDe.trim()
        );

        formData.append(
          "titleAr",
          titleAr.trim()
        );

        formData.append(
          "descriptionEn",
          descriptionEn.trim()
        );

        formData.append(
          "descriptionDe",
          descriptionDe.trim()
        );

        formData.append(
          "descriptionAr",
          descriptionAr.trim()
        );

        if (
          imageFile
        ) {
          formData.append(
            "image",
            imageFile
          );
        }

        if (
          editingId
        ) {

          await galleryRequest(
            `/${editingId}`,
            {
              method:
                "PATCH",

              body:
                formData,
            }
          );

          setMessage(
            copy.updated
          );

        } else {

          await galleryRequest(
            "/",
            {
              method:
                "POST",

              body:
                formData,
            }
          );

          setMessage(
            copy.created
          );
        }

        resetForm();

        await loadImages();

      } catch (
        requestError
      ) {

        setError(
          requestError.message ||
          copy.saveError
        );

      } finally {

        setSaving(
          false
        );
      }
    };

  const handleDelete =
    async (
      image
    ) => {

      const confirmed =
        window.confirm(
          copy.deleteConfirm
        );

      if (
        !confirmed
      ) {
        return;
      }

      setError(
        ""
      );

      setMessage(
        ""
      );

      setDeletingId(
        image.id
      );

      try {

        await galleryRequest(
          `/${image.id}`,
          {
            method:
              "DELETE",
          }
        );

        if (
          editingId ===
          image.id
        ) {
          resetForm();
        }

        setMessage(
          copy.deleted
        );

        await loadImages();

      } catch (
        requestError
      ) {

        setError(
          requestError.message ||
          copy.deleteError
        );

      } finally {

        setDeletingId(
          null
        );
      }
    };

  const isArabic =
    language === "ar";

  return (
    <main
      className="min-h-[calc(100vh-86px)] bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8"
      dir={
        isArabic
          ? "rtl"
          : "ltr"
      }
    >
      <div className="mx-auto max-w-7xl">

        <section className="mb-8 text-center">

          <div className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold tracking-wide text-cyan-300">
            {
              copy.badge
            }
          </div>

          <h1 className="text-3xl font-bold sm:text-4xl">
            {
              copy.title
            }
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            {
              copy.intro
            }
          </p>

        </section>

        {
          error &&
          (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-300">
              {
                error
              }
            </div>
          )
        }

        {
          message &&
          (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-emerald-300">
              {
                message
              }
            </div>
          )
        }

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20 sm:p-7">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

            <h2 className="text-2xl font-bold">
              {
                editingId
                  ? copy.editTitle
                  : copy.createTitle
              }
            </h2>

            {
              editingId &&
              (
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:bg-slate-800"
                >
                  {
                    copy.cancel
                  }
                </button>
              )
            }

          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-7"
          >

            <div className="grid gap-5 lg:grid-cols-3">

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  {
                    copy.titleEnglish
                  }
                  {" *"}
                </span>

                <input
                  type="text"
                  value={
                    titleEn
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setTitleEn(
                        event
                          .target
                          .value
                      )
                  }
                  maxLength={
                    200
                  }
                  dir="ltr"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  placeholder={
                    copy.titleEnPlaceholder
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  {
                    copy.titleGerman
                  }
                </span>

                <input
                  type="text"
                  value={
                    titleDe
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setTitleDe(
                        event
                          .target
                          .value
                      )
                  }
                  maxLength={
                    200
                  }
                  dir="ltr"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  placeholder={
                    copy.titleDePlaceholder
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  {
                    copy.titleArabic
                  }
                </span>

                <input
                  type="text"
                  value={
                    titleAr
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setTitleAr(
                        event
                          .target
                          .value
                      )
                  }
                  maxLength={
                    200
                  }
                  dir="rtl"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-right text-white outline-none transition focus:border-cyan-400"
                  placeholder={
                    copy.titleArPlaceholder
                  }
                />
              </label>

            </div>

            <div className="grid gap-5 lg:grid-cols-3">

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  {
                    copy.descriptionEnglish
                  }
                </span>

                <textarea
                  value={
                    descriptionEn
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setDescriptionEn(
                        event
                          .target
                          .value
                      )
                  }
                  maxLength={
                    5000
                  }
                  rows={
                    6
                  }
                  dir="ltr"
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  placeholder={
                    copy.descriptionEnPlaceholder
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  {
                    copy.descriptionGerman
                  }
                </span>

                <textarea
                  value={
                    descriptionDe
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setDescriptionDe(
                        event
                          .target
                          .value
                      )
                  }
                  maxLength={
                    5000
                  }
                  rows={
                    6
                  }
                  dir="ltr"
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  placeholder={
                    copy.descriptionDePlaceholder
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  {
                    copy.descriptionArabic
                  }
                </span>

                <textarea
                  value={
                    descriptionAr
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setDescriptionAr(
                        event
                          .target
                          .value
                      )
                  }
                  maxLength={
                    5000
                  }
                  rows={
                    6
                  }
                  dir="rtl"
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-right text-white outline-none transition focus:border-cyan-400"
                  placeholder={
                    copy.descriptionArPlaceholder
                  }
                />
              </label>

            </div>

            <div>
              <label className="block">

                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  {
                    copy.imageFile
                  }
                  {
                    !editingId &&
                    " *"
                  }
                </span>

                <input
                  ref={
                    imageInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={
                    handleImageChange
                  }
                  className="block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:font-semibold file:text-slate-950 hover:file:bg-cyan-400"
                />

              </label>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {
                  editingId
                    ? copy.imageOptional
                    : copy.imageHelp
                }
              </p>
            </div>

            {
              existingImageUrl &&
              (
                <div>

                  <p className="mb-3 text-sm font-semibold text-slate-300">
                    {
                      copy.currentImage
                    }
                  </p>

                  <img
                    src={
                      existingImageUrl
                    }
                    alt={
                      titleEn ||
                      copy.imageAlt
                    }
                    className="max-h-80 rounded-xl border border-slate-700 object-contain"
                  />

                </div>
              )
            }

            {
              imagePreview &&
              (
                <div>

                  <p className="mb-3 text-sm font-semibold text-cyan-300">
                    {
                      copy.newPreview
                    }
                  </p>

                  <img
                    src={
                      imagePreview
                    }
                    alt={
                      titleEn ||
                      copy.imageAlt
                    }
                    className="max-h-96 rounded-xl border border-cyan-500/40 object-contain"
                  />

                </div>
              )
            }

            <div className="flex flex-wrap gap-3">

              <button
                type="submit"
                disabled={
                  saving
                }
                className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {
                  saving
                    ? copy.saving
                    : editingId
                      ? copy.update
                      : copy.upload
                }
              </button>

              {
                editingId &&
                (
                  <button
                    type="button"
                    onClick={
                      resetForm
                    }
                    disabled={
                      saving
                    }
                    className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {
                      copy.cancel
                    }
                  </button>
                )
              }

            </div>

          </form>

        </section>

        <section className="mt-10">

          <h2 className="mb-6 text-2xl font-bold">
            {
              copy.existing
            }
          </h2>

          {
            loading
              ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-300">
                  {
                    copy.loading
                  }
                </div>
              )

              : images.length ===
                0
                ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center text-slate-400">
                    {
                      copy.empty
                    }
                  </div>
                )

                : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                    {
                      images.map(
                        (
                          image
                        ) => {

                          const displayTitle =
                            getPreferredTitle(
                              image,
                              language
                            );

                          return (
                            <article
                              key={
                                image.id
                              }
                              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"
                            >

                              <img
                                src={
                                  getImageUrl(
                                    image.imageUrl
                                  )
                                }
                                alt={
                                  displayTitle ||
                                  copy.imageAlt
                                }
                                loading="lazy"
                                className="aspect-[4/3] w-full bg-black object-cover"
                              />

                              <div className="p-5">

                                <h3 className="font-bold text-white">
                                  {
                                    displayTitle
                                  }
                                </h3>

                                <div className="mt-5 flex flex-wrap gap-3">

                                  <button
                                    type="button"
                                    onClick={
                                      () =>
                                        handleEdit(
                                          image
                                        )
                                    }
                                    className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                                  >
                                    {
                                      copy.edit
                                    }
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      deletingId ===
                                      image.id
                                    }
                                    onClick={
                                      () =>
                                        handleDelete(
                                          image
                                        )
                                    }
                                    className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {
                                      deletingId ===
                                      image.id
                                        ? copy.deleting
                                        : copy.delete
                                    }
                                  </button>

                                </div>

                              </div>

                            </article>
                          );
                        }
                      )
                    }

                  </div>
                )
          }

        </section>

      </div>
    </main>
  );
}

export default AdminGallery;
