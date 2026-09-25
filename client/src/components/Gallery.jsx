import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useLanguage,
} from "../context/LanguageContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001/api";

const TEXT = {
  en: {
    badge:
      "Image Gallery",

    title:
      "Gallery",

    intro:
      "Explore a collection of images with stories and descriptions in English, German and Arabic.",

    loading:
      "Images are loading...",

    emptyTitle:
      "No images yet",

    emptyText:
      "New images will appear here after they are uploaded.",

    loadError:
      "The image gallery could not be loaded.",

    tryAgain:
      "Try Again",

    close:
      "Close image",

    enlarge:
      "Open enlarged image",

    image:
      "Gallery image",
  },

  de: {
    badge:
      "Bildergalerie",

    title:
      "Galerie",

    intro:
      "Entdecken Sie eine Sammlung von Bildern mit Geschichten und Beschreibungen auf Englisch, Deutsch und Arabisch.",

    loading:
      "Bilder werden geladen...",

    emptyTitle:
      "Noch keine Bilder",

    emptyText:
      "Neue Bilder erscheinen hier, sobald sie hochgeladen wurden.",

    loadError:
      "Die Bildergalerie konnte nicht geladen werden.",

    tryAgain:
      "Erneut versuchen",

    close:
      "Bild schließen",

    enlarge:
      "Bild vergrößern",

    image:
      "Galeriebild",
  },

  ar: {
    badge:
      "معرض الصور",

    title:
      "معرض الصور",

    intro:
      "اكتشف مجموعة من الصور مع القصص والأوصاف باللغات الإنجليزية والألمانية والعربية.",

    loading:
      "جارٍ تحميل الصور...",

    emptyTitle:
      "لا توجد صور بعد",

    emptyText:
      "ستظهر الصور الجديدة هنا بعد رفعها.",

    loadError:
      "تعذر تحميل معرض الصور.",

    tryAgain:
      "حاول مرة أخرى",

    close:
      "إغلاق الصورة",

    enlarge:
      "فتح الصورة بحجم أكبر",

    image:
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

function getLocalizedTitle(
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

function getLocalizedDescription(
  image,
  language
) {
  if (
    language === "de"
  ) {
    return (
      image.descriptionDe ||
      image.descriptionEn ||
      ""
    );
  }

  if (
    language === "ar"
  ) {
    return (
      image.descriptionAr ||
      image.descriptionEn ||
      ""
    );
  }

  return (
    image.descriptionEn ||
    ""
  );
}

function Gallery() {
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
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

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

          const response =
            await fetch(
              `${API_URL}/gallery`,
              {
                credentials:
                  "include",
              }
            );

          const data =
            await response
              .json();

          if (
            !response.ok
          ) {
            throw new Error(
              data.error ||
              "Gallery request failed."
            );
          }

          setImages(
            data.images ||
            []
          );

        } catch (
          requestError
        ) {

          console.error(
            requestError
          );

          setImages(
            []
          );

          setError(
            requestError
              .message ||
            "Gallery request failed."
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

      loadImages();

    },
    [
      loadImages,
    ]
  );

  useEffect(
    () => {

      if (
        !selectedImage
      ) {
        return undefined;
      }

      const previousOverflow =
        document.body
          .style
          .overflow;

      document.body
        .style
        .overflow =
        "hidden";

      const handleKeyDown =
        (event) => {

          if (
            event.key ===
            "Escape"
          ) {
            setSelectedImage(
              null
            );
          }
        };

      window.addEventListener(
        "keydown",
        handleKeyDown
      );

      return () => {

        document.body
          .style
          .overflow =
          previousOverflow;

        window
          .removeEventListener(
            "keydown",
            handleKeyDown
          );
      };

    },
    [
      selectedImage,
    ]
  );

  const isArabic =
    language === "ar";

  return (
    <main
      className="min-h-[calc(100vh-86px)] bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8"
      dir={
        isArabic
          ? "rtl"
          : "ltr"
      }
    >
      <div className="mx-auto max-w-7xl">

        <section className="mb-10 text-center">

          <div className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold tracking-wide text-cyan-300">
            {
              copy.badge
            }
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {
              copy.title
            }
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            {
              copy.intro
            }
          </p>

        </section>

        {
          loading
            ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center text-slate-300">
                {
                  copy.loading
                }
              </div>
            )

            : error
              ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">

                  <p className="text-red-300">
                    {
                      copy.loadError
                    }
                  </p>

                  <button
                    type="button"
                    onClick={
                      loadImages
                    }
                    className="mt-5 rounded-xl bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    {
                      copy.tryAgain
                    }
                  </button>

                </div>
              )

              : images.length ===
                0
                ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center">

                    <div className="text-5xl">
                      🖼️
                    </div>

                    <h2 className="mt-5 text-xl font-semibold">
                      {
                        copy.emptyTitle
                      }
                    </h2>

                    <p className="mt-2 text-slate-400">
                      {
                        copy.emptyText
                      }
                    </p>

                  </div>
                )

                : (
                  <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

                    {
                      images.map(
                        (
                          image
                        ) => {

                          const title =
                            getLocalizedTitle(
                              image,
                              language
                            );

                          const description =
                            getLocalizedDescription(
                              image,
                              language
                            );

                          const src =
                            getImageUrl(
                              image.imageUrl
                            );

                          return (
                            <article
                              key={
                                image.id
                              }
                              className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-black/20"
                            >

                              <button
                                type="button"
                                onClick={
                                  () =>
                                    setSelectedImage(
                                      image
                                    )
                                }
                                aria-label={
                                  `${copy.enlarge}: ${title || copy.image}`
                                }
                                className="block w-full overflow-hidden bg-black text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                              >

                                <img
                                  src={
                                    src
                                  }
                                  alt={
                                    title ||
                                    copy.image
                                  }
                                  loading="lazy"
                                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                                />

                              </button>

                              <div className="p-5">

                                <h2 className="text-xl font-bold text-white">
                                  {
                                    title
                                  }
                                </h2>

                                {
                                  description &&
                                  (
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                      {
                                        description
                                      }
                                    </p>
                                  )
                                }

                                {
                                  image.createdAt &&
                                  (
                                    <div className="mt-4 text-xs text-slate-500">
                                      {
                                        new Date(
                                          image.createdAt
                                        )
                                          .toLocaleDateString(
                                            language ===
                                            "de"
                                              ? "de-DE"
                                              : language ===
                                                "ar"
                                                ? "ar"
                                                : "en-US"
                                          )
                                      }
                                    </div>
                                  )
                                }

                              </div>

                            </article>
                          );
                        }
                      )
                    }

                  </div>
                )
        }

      </div>

      {
        selectedImage &&
        (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={
              getLocalizedTitle(
                selectedImage,
                language
              ) ||
              copy.image
            }
            onClick={
              () =>
                setSelectedImage(
                  null
                )
            }
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          >

            <button
              type="button"
              onClick={
                () =>
                  setSelectedImage(
                    null
                  )
              }
              aria-label={
                copy.close
              }
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-2xl text-white transition hover:bg-white hover:text-black sm:right-8 sm:top-8"
            >
              ×
            </button>

            <div
              onClick={
                (
                  event
                ) =>
                  event
                    .stopPropagation()
              }
              className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl"
            >

              <div className="flex min-h-0 flex-1 items-center justify-center bg-black">

                <img
                  src={
                    getImageUrl(
                      selectedImage
                        .imageUrl
                    )
                  }
                  alt={
                    getLocalizedTitle(
                      selectedImage,
                      language
                    ) ||
                    copy.image
                  }
                  className="max-h-[72vh] max-w-full object-contain"
                />

              </div>

              <div className="max-h-[20vh] overflow-y-auto p-5 sm:p-6">

                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  {
                    getLocalizedTitle(
                      selectedImage,
                      language
                    )
                  }
                </h2>

                {
                  getLocalizedDescription(
                    selectedImage,
                    language
                  ) &&
                  (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300 sm:text-base">
                      {
                        getLocalizedDescription(
                          selectedImage,
                          language
                        )
                      }
                    </p>
                  )
                }

              </div>

            </div>

          </div>
        )
      }

    </main>
  );
}

export default Gallery;
