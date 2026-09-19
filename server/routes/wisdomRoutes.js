const express = require("express");
const { Sequelize } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const {
  WisdomQuote,
} = require("../models");

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");

const router = express.Router();

const MAX_QUOTE_LENGTH = 1000;

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const IMAGE_STORAGE_ROOT =
  process.env.WISDOM_IMAGE_STORAGE_ROOT ||
  (
    process.env.RAILWAY_VOLUME_MOUNT_PATH
      ? path.join(
          process.env.RAILWAY_VOLUME_MOUNT_PATH,
          "wisdom-images"
        )
      : path.join(
          __dirname,
          "..",
          "storage",
          "wisdom-images"
        )
  );

const normalizeQuote = (value) =>
  String(value || "").trim();

const normalizeBoolean = (value) =>
  value === true ||
  value === 1 ||
  value === "1" ||
  String(value || "").toLowerCase() ===
    "true";

const validateQuote = (quote) => {
  if (!quote) {
    return "Wisdom quote is required.";
  }

  if (quote.length > MAX_QUOTE_LENGTH) {
    return (
      "Wisdom quote must not exceed " +
      `${MAX_QUOTE_LENGTH} characters.`
    );
  }

  return null;
};

const ensureImageDirectory =
  async () => {
    await fs.promises.mkdir(
      IMAGE_STORAGE_ROOT,
      {
        recursive: true,
      }
    );
  };

const isSafeFilename = (filename) => {
  if (!filename) {
    return false;
  }

  return (
    filename === path.basename(filename) &&
    !filename.includes("..") &&
    !filename.includes("/") &&
    !filename.includes("\\")
  );
};

const getImagePath = (filename) => {
  if (!isSafeFilename(filename)) {
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
      getImagePath(filename);

    if (!imagePath) {
      return;
    }

    try {
      await fs.promises.unlink(imagePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(
          "Delete wisdom image error:",
          error
        );
      }
    }
  };

const createImageFilename =
  (file) => {
    const extension =
      ALLOWED_IMAGE_TYPES[file.mimetype];

    return (
      Date.now() +
      "-" +
      crypto.randomUUID() +
      extension
    );
  };

const storage =
  multer.diskStorage({
    destination: async (
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
        callback(error);
      }
    },

    filename: (
      req,
      file,
      callback
    ) => {
      callback(
        null,
        createImageFilename(file)
      );
    },
  });

const upload =
  multer({
    storage,

    limits: {
      fileSize: MAX_IMAGE_SIZE,
      files: 1,
    },

    fileFilter: (
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
            "Only JPG, PNG and WEBP images are allowed."
          )
        );
      }

      callback(null, true);
    },
  });

const handleImageUpload =
  (req, res, next) => {
    upload.single("image")(
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
          return res.status(400).json({
            success: false,
            error:
              "Image must not exceed 10 MB.",
          });
        }

        return res.status(400).json({
          success: false,
          error:
            error.message ||
            "Unable to upload wisdom image.",
        });
      }
    );
  };

const serializeQuote =
  (record) => {
    const data =
      typeof record?.toJSON ===
      "function"
        ? record.toJSON()
        : record;

    return {
      ...data,

      imageUrl:
        data?.imageFilename
          ? (
              "/wisdom/images/" +
              encodeURIComponent(
                data.imageFilename
              )
            )
          : null,
    };
  };

/*
 * PUBLIC
 * Serve one stored wisdom image.
 */
router.get(
  "/images/:filename",
  async (req, res) => {
    const filename =
      req.params.filename;

    const imagePath =
      getImagePath(filename);

    if (!imagePath) {
      return res.status(404).json({
        success: false,
        error:
          "Wisdom image not found.",
      });
    }

    try {
      const stat =
        await fs.promises.stat(
          imagePath
        );

      if (!stat.isFile()) {
        return res.status(404).json({
          success: false,
          error:
            "Wisdom image not found.",
        });
      }

      return res.sendFile(imagePath);
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({
          success: false,
          error:
            "Wisdom image not found.",
        });
      }

      console.error(
        "Wisdom image error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to load wisdom image.",
      });
    }
  }
);

/*
 * PUBLIC
 * Return one randomly selected quote.
 */
router.get(
  "/random",
  async (req, res) => {
    try {
      const quote =
        await WisdomQuote.findOne({
          order:
            Sequelize.literal(
              "RANDOM()"
            ),

          attributes: [
            "id",
            "quote",
            "imageFilename",
          ],
        });

      if (!quote) {
        return res.status(404).json({
          success: false,
          error:
            "No wisdom quotes are available yet.",
        });
      }

      return res.json({
        success: true,
        quote:
          serializeQuote(quote),
      });
    } catch (error) {
      console.error(
        "Random wisdom quote error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to load a wisdom quote.",
      });
    }
  }
);

/*
 * ADMIN ONLY
 * Return all administrator-managed quotes.
 */
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const quotes =
        await WisdomQuote.findAll({
          attributes: [
            "id",
            "quote",
            "imageFilename",
            "createdAt",
            "updatedAt",
          ],

          order: [
            ["createdAt", "DESC"],
            ["id", "DESC"],
          ],
        });

      return res.json({
        success: true,
        quotes:
          quotes.map(
            serializeQuote
          ),
      });
    } catch (error) {
      console.error(
        "Wisdom quote list error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to load wisdom quotes.",
      });
    }
  }
);

/*
 * ADMIN ONLY
 * Create a wisdom quote with an
 * optional Pearl of Wisdom image.
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  handleImageUpload,
  async (req, res) => {
    const uploadedFilename =
      req.file?.filename || null;

    try {
      const quote =
        normalizeQuote(
          req.body.quote
        );

      const validationError =
        validateQuote(quote);

      if (validationError) {
        if (uploadedFilename) {
          await deleteImageFile(
            uploadedFilename
          );
        }

        return res.status(400).json({
          success: false,
          error: validationError,
        });
      }

      const created =
        await WisdomQuote.create({
          quote,

          imageFilename:
            uploadedFilename,
        });

      return res.status(201).json({
        success: true,
        message:
          "Wisdom quote created successfully.",
        quote:
          serializeQuote(created),
      });
    } catch (error) {
      if (uploadedFilename) {
        await deleteImageFile(
          uploadedFilename
        );
      }

      console.error(
        "Create wisdom quote error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to create wisdom quote.",
      });
    }
  }
);

/*
 * ADMIN ONLY
 * Edit quote and optionally:
 * - upload a new image
 * - replace the old image
 * - remove the old image
 */
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  handleImageUpload,
  async (req, res) => {
    const uploadedFilename =
      req.file?.filename || null;

    try {
      const id =
        Number(req.params.id);

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        if (uploadedFilename) {
          await deleteImageFile(
            uploadedFilename
          );
        }

        return res.status(400).json({
          success: false,
          error:
            "Invalid wisdom quote ID.",
        });
      }

      const quote =
        normalizeQuote(
          req.body.quote
        );

      const validationError =
        validateQuote(quote);

      if (validationError) {
        if (uploadedFilename) {
          await deleteImageFile(
            uploadedFilename
          );
        }

        return res.status(400).json({
          success: false,
          error: validationError,
        });
      }

      const existing =
        await WisdomQuote.findByPk(
          id
        );

      if (!existing) {
        if (uploadedFilename) {
          await deleteImageFile(
            uploadedFilename
          );
        }

        return res.status(404).json({
          success: false,
          error:
            "Wisdom quote not found.",
        });
      }

      const oldImageFilename =
        existing.imageFilename;

      const removeImage =
        normalizeBoolean(
          req.body.removeImage
        );

      let nextImageFilename =
        oldImageFilename;

      if (uploadedFilename) {
        nextImageFilename =
          uploadedFilename;
      } else if (removeImage) {
        nextImageFilename = null;
      }

      existing.quote = quote;

      existing.imageFilename =
        nextImageFilename;

      try {
        await existing.save();
      } catch (error) {
        if (uploadedFilename) {
          await deleteImageFile(
            uploadedFilename
          );
        }

        throw error;
      }

      if (
        oldImageFilename &&
        oldImageFilename !==
          nextImageFilename
      ) {
        await deleteImageFile(
          oldImageFilename
        );
      }

      return res.json({
        success: true,
        message:
          "Wisdom quote updated successfully.",
        quote:
          serializeQuote(existing),
      });
    } catch (error) {
      console.error(
        "Update wisdom quote error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to update wisdom quote.",
      });
    }
  }
);

/*
 * ADMIN ONLY
 * Delete quote and its image.
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id =
        Number(req.params.id);

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid wisdom quote ID.",
        });
      }

      const existing =
        await WisdomQuote.findByPk(
          id
        );

      if (!existing) {
        return res.status(404).json({
          success: false,
          error:
            "Wisdom quote not found.",
        });
      }

      const imageFilename =
        existing.imageFilename;

      await existing.destroy();

      if (imageFilename) {
        await deleteImageFile(
          imageFilename
        );
      }

      return res.json({
        success: true,
        message:
          "Wisdom quote deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete wisdom quote error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to delete wisdom quote.",
      });
    }
  }
);

module.exports = router;
