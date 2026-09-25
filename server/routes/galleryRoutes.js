const express =
  require("express");

const multer =
  require("multer");

const path =
  require("path");

const fs =
  require("fs");

const crypto =
  require("crypto");

const {
  GalleryImage,
} = require("../models");

const authMiddleware =
  require(
    "../middleware/authMiddleware"
  );

const adminMiddleware =
  require(
    "../middleware/adminMiddleware"
  );

const router =
  express.Router();

const MAX_TITLE_LENGTH =
  200;

const MAX_DESCRIPTION_LENGTH =
  5000;

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg":
    ".jpg",

  "image/png":
    ".png",

  "image/webp":
    ".webp",

  "image/gif":
    ".gif",
};

const IMAGE_STORAGE_ROOT =
  process.env
    .IMAGE_STORAGE_ROOT ||
  (
    process.env
      .RAILWAY_VOLUME_MOUNT_PATH

      ? path.join(
          process.env
            .RAILWAY_VOLUME_MOUNT_PATH,
          "images"
        )

      : path.join(
          __dirname,
          "..",
          "storage",
          "images"
        )
  );

const ensureImageDirectory =
  async () => {

    await fs.promises.mkdir(
      IMAGE_STORAGE_ROOT,
      {
        recursive: true,
      }
    );
  };

const normalizeTitle =
  (value) =>
    String(
      value ?? ""
    ).trim();

const normalizeDescription =
  (value) =>
    String(
      value ?? ""
    ).trim();

const validateGalleryText =
  ({
    titleEn,
    titleDe,
    titleAr,
    descriptionEn,
    descriptionDe,
    descriptionAr,
  }) => {

    if (!titleEn) {
      return (
        "English image title is required."
      );
    }

    if (
      titleEn.length >
        MAX_TITLE_LENGTH ||
      titleDe.length >
        MAX_TITLE_LENGTH ||
      titleAr.length >
        MAX_TITLE_LENGTH
    ) {
      return (
        "Image titles must not exceed " +
        `${MAX_TITLE_LENGTH} characters.`
      );
    }

    if (
      descriptionEn.length >
        MAX_DESCRIPTION_LENGTH ||
      descriptionDe.length >
        MAX_DESCRIPTION_LENGTH ||
      descriptionAr.length >
        MAX_DESCRIPTION_LENGTH
    ) {
      return (
        "Image descriptions must not exceed " +
        `${MAX_DESCRIPTION_LENGTH} characters.`
      );
    }

    return null;
  };

const isSafeFilename =
  (filename) => {

    if (!filename) {
      return false;
    }

    return (
      filename ===
        path.basename(
          filename
        ) &&

      !filename.includes(
        ".."
      ) &&

      !filename.includes(
        "/"
      ) &&

      !filename.includes(
        "\\"
      )
    );
  };

const getImagePath =
  (filename) => {

    if (
      !isSafeFilename(
        filename
      )
    ) {
      return null;
    }

    return path.join(
      IMAGE_STORAGE_ROOT,
      filename
    );
  };

const deleteImageFile =
  async (filename) => {

    const imagePath =
      getImagePath(
        filename
      );

    if (!imagePath) {
      return;
    }

    try {

      await fs.promises.unlink(
        imagePath
      );

    } catch (error) {

      if (
        error.code !==
        "ENOENT"
      ) {
        console.error(
          "Delete gallery image error:",
          error
        );
      }
    }
  };

const createImageFilename =
  (file) => {

    const extension =
      ALLOWED_IMAGE_TYPES[
        file.mimetype
      ];

    return (
      Date.now() +
      "-" +
      crypto.randomUUID() +
      extension
    );
  };

const storage =
  multer.diskStorage({

    destination:
      async (
        req,
        file,
        callback
      ) => {

        try {

          await ensureImageDirectory();

          callback(
            null,
            IMAGE_STORAGE_ROOT
          );

        } catch (error) {

          callback(
            error
          );
        }
      },

    filename:
      (
        req,
        file,
        callback
      ) => {

        try {

          callback(
            null,
            createImageFilename(
              file
            )
          );

        } catch (error) {

          callback(
            error
          );
        }
      },
  });

const upload =
  multer({

    storage,

    limits: {
      fileSize:
        MAX_IMAGE_SIZE,

      files:
        1,
    },

    fileFilter:
      (
        req,
        file,
        callback
      ) => {

        if (
          !ALLOWED_IMAGE_TYPES[
            file.mimetype
          ]
        ) {
          return callback(
            new Error(
              "Only JPG, PNG, WEBP and GIF images are allowed."
            )
          );
        }

        callback(
          null,
          true
        );
      },
  });

const runImageUpload =
  (
    req,
    res,
    next
  ) => {

    upload.single(
      "image"
    )(
      req,
      res,
      (error) => {

        if (!error) {
          return next();
        }

        if (
          error instanceof
            multer.MulterError &&
          error.code ===
            "LIMIT_FILE_SIZE"
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              error:
                "Image must not exceed 10 MB.",
            });
        }

        return res
          .status(400)
          .json({
            success:
              false,

            error:
              error.message ||
              "Image upload failed.",
          });
      }
    );
  };

const serializeGalleryImage =
  (record) => {

    const data =
      typeof record?.toJSON ===
        "function"

        ? record.toJSON()

        : record;

    return {
      ...data,

      imageSize:
        data.imageSize == null

          ? null

          : Number(
              data.imageSize
            ),

      imageUrl:
        data.imageFilename

          ? (
              "/gallery/image/" +
              encodeURIComponent(
                data.imageFilename
              )
            )

          : null,
    };
  };

const getTextFields =
  (
    body,
    existing = null
  ) => {

    const useExisting =
      (
        field,
        normalizer
      ) => {

        if (
          body[field] ===
          undefined
        ) {
          return normalizer(
            existing?.[field] ??
            ""
          );
        }

        return normalizer(
          body[field]
        );
      };

    return {
      titleEn:
        useExisting(
          "titleEn",
          normalizeTitle
        ),

      titleDe:
        useExisting(
          "titleDe",
          normalizeTitle
        ),

      titleAr:
        useExisting(
          "titleAr",
          normalizeTitle
        ),

      descriptionEn:
        useExisting(
          "descriptionEn",
          normalizeDescription
        ),

      descriptionDe:
        useExisting(
          "descriptionDe",
          normalizeDescription
        ),

      descriptionAr:
        useExisting(
          "descriptionAr",
          normalizeDescription
        ),
    };
  };

/*
 * PUBLIC:
 * GET /api/gallery
 *
 * Returns gallery metadata.
 */
router.get(
  "/",
  async (
    req,
    res
  ) => {

    try {

      const images =
        await GalleryImage
          .findAll({
            order: [
              [
                "createdAt",
                "DESC",
              ],
              [
                "id",
                "DESC",
              ],
            ],
          });

      return res.json({
        success:
          true,

        images:
          images.map(
            serializeGalleryImage
          ),
      });

    } catch (error) {

      console.error(
        "Load gallery error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          error:
            "Unable to load gallery.",
        });
    }
  }
);

/*
 * PUBLIC:
 * GET /api/gallery/image/:filename
 *
 * Serves only image files that
 * belong to a gallery database row.
 */
router.get(
  "/image/:filename",
  async (
    req,
    res
  ) => {

    try {

      const filename =
        req.params.filename;

      if (
        !isSafeFilename(
          filename
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            error:
              "Invalid image filename.",
          });
      }

      const image =
        await GalleryImage
          .findOne({
            where: {
              imageFilename:
                filename,
            },
          });

      if (!image) {
        return res
          .status(404)
          .json({
            success:
              false,

            error:
              "Image not found.",
          });
      }

      const imagePath =
        getImagePath(
          filename
        );

      let stat;

      try {

        stat =
          await fs.promises.stat(
            imagePath
          );

      } catch (error) {

        if (
          error.code ===
          "ENOENT"
        ) {
          return res
            .status(404)
            .json({
              success:
                false,

              error:
                "Image file not found.",
            });
        }

        throw error;
      }

      if (
        !stat.isFile()
      ) {
        return res
          .status(404)
          .json({
            success:
              false,

            error:
              "Image file not found.",
          });
      }

      res.setHeader(
        "Content-Type",
        image.imageMimeType
      );

      res.setHeader(
        "Content-Length",
        stat.size
      );

      res.setHeader(
        "Cache-Control",
        "public, max-age=86400"
      );

      const stream =
        fs.createReadStream(
          imagePath
        );

      stream.on(
        "error",
        (error) => {

          console.error(
            "Gallery image stream error:",
            error
          );

          if (
            !res.headersSent
          ) {
            res
              .status(500)
              .end();
          } else {
            res.destroy(
              error
            );
          }
        }
      );

      stream.pipe(
        res
      );

    } catch (error) {

      console.error(
        "Serve gallery image error:",
        error
      );

      if (
        !res.headersSent
      ) {
        return res
          .status(500)
          .json({
            success:
              false,

            error:
              "Unable to load image.",
          });
      }
    }
  }
);

/*
 * ADMIN:
 * POST /api/gallery
 *
 * Multipart field:
 * image
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  runImageUpload,
  async (
    req,
    res
  ) => {

    try {

      const fields =
        getTextFields(
          req.body
        );

      const textError =
        validateGalleryText(
          fields
        );

      if (textError) {

        if (req.file) {
          await deleteImageFile(
            req.file.filename
          );
        }

        return res
          .status(400)
          .json({
            success:
              false,

            error:
              textError,
          });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({
            success:
              false,

            error:
              "An image file is required.",
          });
      }

      let image;

      try {

        image =
          await GalleryImage
            .create({
              ...fields,

              imageFilename:
                req.file.filename,

              imageMimeType:
                req.file.mimetype,

              imageSize:
                req.file.size,
            });

      } catch (error) {

        await deleteImageFile(
          req.file.filename
        );

        throw error;
      }

      return res
        .status(201)
        .json({
          success:
            true,

          image:
            serializeGalleryImage(
              image
            ),
        });

    } catch (error) {

      console.error(
        "Create gallery image error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          error:
            "Unable to create gallery image.",
        });
    }
  }
);

/*
 * ADMIN:
 * PATCH /api/gallery/:id
 *
 * The image file is optional.
 * If supplied, the existing file
 * is replaced only after the DB
 * update succeeds.
 */
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  runImageUpload,
  async (
    req,
    res
  ) => {

    let uploadedFilename =
      req.file?.filename ||
      null;

    try {

      const image =
        await GalleryImage
          .findByPk(
            req.params.id
          );

      if (!image) {

        if (
          uploadedFilename
        ) {
          await deleteImageFile(
            uploadedFilename
          );
        }

        return res
          .status(404)
          .json({
            success:
              false,

            error:
              "Gallery image not found.",
          });
      }

      const fields =
        getTextFields(
          req.body,
          image
        );

      const textError =
        validateGalleryText(
          fields
        );

      if (textError) {

        if (
          uploadedFilename
        ) {
          await deleteImageFile(
            uploadedFilename
          );
        }

        return res
          .status(400)
          .json({
            success:
              false,

            error:
              textError,
          });
      }

      const oldFilename =
        image.imageFilename;

      const updateData = {
        ...fields,
      };

      if (req.file) {

        updateData.imageFilename =
          req.file.filename;

        updateData.imageMimeType =
          req.file.mimetype;

        updateData.imageSize =
          req.file.size;
      }

      try {

        await image.update(
          updateData
        );

      } catch (error) {

        if (
          uploadedFilename
        ) {
          await deleteImageFile(
            uploadedFilename
          );

          uploadedFilename =
            null;
        }

        throw error;
      }

      if (
        req.file &&
        oldFilename &&
        oldFilename !==
          req.file.filename
      ) {
        await deleteImageFile(
          oldFilename
        );
      }

      uploadedFilename =
        null;

      return res.json({
        success:
          true,

        image:
          serializeGalleryImage(
            image
          ),
      });

    } catch (error) {

      if (
        uploadedFilename
      ) {
        await deleteImageFile(
          uploadedFilename
        );
      }

      console.error(
        "Update gallery image error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          error:
            "Unable to update gallery image.",
        });
    }
  }
);

/*
 * ADMIN:
 * DELETE /api/gallery/:id
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (
    req,
    res
  ) => {

    try {

      const image =
        await GalleryImage
          .findByPk(
            req.params.id
          );

      if (!image) {
        return res
          .status(404)
          .json({
            success:
              false,

            error:
              "Gallery image not found.",
          });
      }

      const filename =
        image.imageFilename;

      await image.destroy();

      await deleteImageFile(
        filename
      );

      return res.json({
        success:
          true,

        message:
          "Gallery image deleted.",
      });

    } catch (error) {

      console.error(
        "Delete gallery image error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          error:
            "Unable to delete gallery image.",
        });
    }
  }
);

module.exports =
  router;
