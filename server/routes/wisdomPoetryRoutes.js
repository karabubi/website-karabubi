const express = require("express");
const { Sequelize } = require("sequelize");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const { WisdomPoem } = require("../models");
const authMiddleware = require(
  "../middleware/authMiddleware"
);
const adminMiddleware = require(
  "../middleware/adminMiddleware"
);

const router = express.Router();

const MAX_TITLE_LENGTH = 200;
const MAX_AUTHOR_LENGTH = 200;
const MAX_POEM_LENGTH = 5000;

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const IMAGE_STORAGE_ROOT =
  process.env.WISDOM_POETRY_IMAGE_STORAGE_ROOT ||
  (
    process.env.RAILWAY_VOLUME_MOUNT_PATH
      ? path.join(
          process.env.RAILWAY_VOLUME_MOUNT_PATH,
          "wisdom-poetry-images"
        )
      : path.join(
          __dirname,
          "..",
          "storage",
          "wisdom-poetry-images"
        )
  );

function ensureImageDirectory() {
  fs.mkdirSync(
    IMAGE_STORAGE_ROOT,
    {
      recursive: true,
    }
  );
}

function imageExtension(mimeType) {
  if (mimeType === "image/jpeg") {
    return ".jpg";
  }

  if (mimeType === "image/png") {
    return ".png";
  }

  if (mimeType === "image/webp") {
    return ".webp";
  }

  return "";
}

function makeImageFilename(file) {
  const extension =
    imageExtension(file.mimetype);

  return [
    Date.now(),
    crypto.randomUUID(),
  ].join("-") + extension;
}

function validImageFilename(filename) {
  return (
    filename &&
    filename === path.basename(filename) &&
    !filename.includes("..") &&
    !filename.includes("/") &&
    !filename.includes("\\")
  );
}

function imagePath(filename) {
  if (!validImageFilename(filename)) {
    return null;
  }

  return path.join(
    IMAGE_STORAGE_ROOT,
    filename
  );
}

async function deleteImageFile(filename) {
  const filePath =
    imagePath(filename);

  if (!filePath) {
    return;
  }

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "Delete wisdom poetry image error:",
        error
      );
    }
  }
}

const imageStorage =
  multer.diskStorage({
    destination: (
      req,
      file,
      callback
    ) => {
      try {
        ensureImageDirectory();

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
        makeImageFilename(file)
      );
    },
  });

const imageUpload =
  multer({
    storage: imageStorage,

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
        !ALLOWED_IMAGE_TYPES.has(
          file.mimetype
        )
      ) {
        return callback(
          new Error(
            "Only JPG, PNG and WEBP images are allowed."
          )
        );
      }

      return callback(
        null,
        true
      );
    },
  });

function uploadPoetryImage(
  req,
  res,
  next
) {
  imageUpload.single("image")(
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
            success: false,
            error:
              "Image must be 10 MB or smaller.",
          });
      }

      return res
        .status(400)
        .json({
          success: false,
          error:
            error.message ||
            "Unable to process image upload.",
        });
    }
  );
}

const normalizeText = (
  value
) =>
  String(
    value || ""
  ).trim();

const normalizeBoolean = (
  value
) =>
  String(
    value || ""
  ).toLowerCase() === "true";

const validatePoem = ({
  title,
  author,
  poem,
}) => {
  if (!poem) {
    return "Poem text is required.";
  }

  if (
    poem.length >
    MAX_POEM_LENGTH
  ) {
    return (
      `Poem must not exceed ` +
      `${MAX_POEM_LENGTH} characters.`
    );
  }

  if (
    title.length >
    MAX_TITLE_LENGTH
  ) {
    return (
      `Title must not exceed ` +
      `${MAX_TITLE_LENGTH} characters.`
    );
  }

  if (
    author.length >
    MAX_AUTHOR_LENGTH
  ) {
    return (
      `Author must not exceed ` +
      `${MAX_AUTHOR_LENGTH} characters.`
    );
  }

  return null;
};

function poemResponse(poem) {
  const data =
    typeof poem.toJSON ===
    "function"
      ? poem.toJSON()
      : poem;

  return {
    ...data,

    imageUrl:
      data.imageFilename
        ? (
            "/wisdom-poetry/images/" +
            encodeURIComponent(
              data.imageFilename
            )
          )
        : null,
  };
}

/*
 * PUBLIC
 * Serve a wisdom-poetry image.
 */
router.get(
  "/images/:filename",
  async (req, res) => {
    try {
      const filename =
        String(
          req.params.filename ||
          ""
        );

      if (
        !validImageFilename(
          filename
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Invalid poetry image filename.",
          });
      }

      const filePath =
        imagePath(filename);

      if (
        !filePath ||
        !fs.existsSync(filePath)
      ) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Poetry image not found.",
          });
      }

      res.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );

      return res.sendFile(
        filePath
      );
    } catch (error) {
      console.error(
        "Wisdom poetry image error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Unable to load poetry image.",
        });
    }
  }
);

/*
 * PUBLIC
 * Return one random wisdom poem.
 */
router.get(
  "/random",
  async (req, res) => {
    try {
      const poem =
        await WisdomPoem.findOne({
          order:
            Sequelize.literal(
              "RANDOM()"
            ),

          attributes: [
            "id",
            "title",
            "author",
            "poem",
            "imageFilename",
          ],
        });

      if (!poem) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "No wisdom poems are available yet.",
          });
      }

      return res.json({
        success: true,
        poem:
          poemResponse(poem),
      });
    } catch (error) {
      console.error(
        "Random wisdom poem error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Unable to load a wisdom poem.",
        });
    }
  }
);

/*
 * ADMIN ONLY
 * Return all poems.
 */
router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const poems =
        await WisdomPoem.findAll({
          attributes: [
            "id",
            "title",
            "author",
            "poem",
            "imageFilename",
            "createdAt",
            "updatedAt",
          ],

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
        success: true,
        poems:
          poems.map(
            poemResponse
          ),
      });
    } catch (error) {
      console.error(
        "Wisdom poetry list error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Unable to load wisdom poems.",
        });
    }
  }
);

/*
 * ADMIN ONLY
 * Create poem with optional image.
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  uploadPoetryImage,
  async (req, res) => {
    try {
      const title =
        normalizeText(
          req.body.title
        );

      const author =
        normalizeText(
          req.body.author
        );

      const poem =
        normalizeText(
          req.body.poem
        );

      const validationError =
        validatePoem({
          title,
          author,
          poem,
        });

      if (validationError) {
        if (req.file) {
          await deleteImageFile(
            req.file.filename
          );
        }

        return res
          .status(400)
          .json({
            success: false,
            error:
              validationError,
          });
      }

      const created =
        await WisdomPoem.create({
          title:
            title || null,

          author:
            author || null,

          poem,

          imageFilename:
            req.file
              ? req.file.filename
              : null,
        });

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Wisdom poem created successfully.",

          poem:
            poemResponse(
              created
            ),
        });
    } catch (error) {
      if (req.file) {
        await deleteImageFile(
          req.file.filename
        );
      }

      console.error(
        "Create wisdom poem error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Unable to create wisdom poem.",
        });
    }
  }
);

/*
 * ADMIN ONLY
 * Update poem and optionally replace/remove image.
 */
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  uploadPoetryImage,
  async (req, res) => {
    try {
      const id =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        if (req.file) {
          await deleteImageFile(
            req.file.filename
          );
        }

        return res
          .status(400)
          .json({
            success: false,
            error:
              "Invalid wisdom poem ID.",
          });
      }

      const title =
        normalizeText(
          req.body.title
        );

      const author =
        normalizeText(
          req.body.author
        );

      const poem =
        normalizeText(
          req.body.poem
        );

      const removeImage =
        normalizeBoolean(
          req.body.removeImage
        );

      const validationError =
        validatePoem({
          title,
          author,
          poem,
        });

      if (validationError) {
        if (req.file) {
          await deleteImageFile(
            req.file.filename
          );
        }

        return res
          .status(400)
          .json({
            success: false,
            error:
              validationError,
          });
      }

      const existing =
        await WisdomPoem.findByPk(
          id
        );

      if (!existing) {
        if (req.file) {
          await deleteImageFile(
            req.file.filename
          );
        }

        return res
          .status(404)
          .json({
            success: false,
            error:
              "Wisdom poem not found.",
          });
      }

      const oldImage =
        existing.imageFilename;

      let nextImage =
        oldImage;

      if (req.file) {
        nextImage =
          req.file.filename;
      } else if (
        removeImage
      ) {
        nextImage = null;
      }

      existing.title =
        title || null;

      existing.author =
        author || null;

      existing.poem =
        poem;

      existing.imageFilename =
        nextImage;

      await existing.save();

      if (
        oldImage &&
        oldImage !== nextImage
      ) {
        await deleteImageFile(
          oldImage
        );
      }

      return res.json({
        success: true,

        message:
          "Wisdom poem updated successfully.",

        poem:
          poemResponse(
            existing
          ),
      });
    } catch (error) {
      if (req.file) {
        await deleteImageFile(
          req.file.filename
        );
      }

      console.error(
        "Update wisdom poem error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Unable to update wisdom poem.",
        });
    }
  }
);

/*
 * ADMIN ONLY
 * Delete poem and its image.
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Invalid wisdom poem ID.",
          });
      }

      const existing =
        await WisdomPoem.findByPk(
          id
        );

      if (!existing) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Wisdom poem not found.",
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
          "Wisdom poem deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete wisdom poem error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Unable to delete wisdom poem.",
        });
    }
  }
);

module.exports = router;
