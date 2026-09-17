const express = require("express");
const { Sequelize } = require("sequelize");
const { WisdomPoem } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const MAX_TITLE_LENGTH = 200;
const MAX_AUTHOR_LENGTH = 200;
const MAX_POEM_LENGTH = 5000;

const normalizeText = (value) =>
  String(value || "").trim();

const validatePoem = ({ title, author, poem }) => {
  if (!poem) {
    return "Poem text is required.";
  }

  if (poem.length > MAX_POEM_LENGTH) {
    return `Poem must not exceed ${MAX_POEM_LENGTH} characters.`;
  }

  if (title.length > MAX_TITLE_LENGTH) {
    return `Title must not exceed ${MAX_TITLE_LENGTH} characters.`;
  }

  if (author.length > MAX_AUTHOR_LENGTH) {
    return `Author must not exceed ${MAX_AUTHOR_LENGTH} characters.`;
  }

  return null;
};

/*
 * PUBLIC
 * Return one random wisdom poem.
 */
router.get("/random", async (req, res) => {
  try {
    const poem = await WisdomPoem.findOne({
      order: Sequelize.literal("RANDOM()"),
      attributes: [
        "id",
        "title",
        "author",
        "poem",
      ],
    });

    if (!poem) {
      return res.status(404).json({
        success: false,
        error: "No wisdom poems are available yet.",
      });
    }

    return res.json({
      success: true,
      poem,
    });
  } catch (error) {
    console.error(
      "Random wisdom poem error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to load a wisdom poem.",
    });
  }
});

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
      const poems = await WisdomPoem.findAll({
        attributes: [
          "id",
          "title",
          "author",
          "poem",
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
        poems,
      });
    } catch (error) {
      console.error(
        "Wisdom poetry list error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Unable to load wisdom poems.",
      });
    }
  }
);

/*
 * ADMIN ONLY
 * Create poem.
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const title =
        normalizeText(req.body.title);
      const author =
        normalizeText(req.body.author);
      const poem =
        normalizeText(req.body.poem);

      const validationError =
        validatePoem({
          title,
          author,
          poem,
        });

      if (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError,
        });
      }

      const created =
        await WisdomPoem.create({
          title: title || null,
          author: author || null,
          poem,
        });

      return res.status(201).json({
        success: true,
        message:
          "Wisdom poem created successfully.",
        poem: created,
      });
    } catch (error) {
      console.error(
        "Create wisdom poem error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Unable to create wisdom poem.",
      });
    }
  }
);

/*
 * ADMIN ONLY
 * Update poem.
 */
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid wisdom poem ID.",
        });
      }

      const title =
        normalizeText(req.body.title);
      const author =
        normalizeText(req.body.author);
      const poem =
        normalizeText(req.body.poem);

      const validationError =
        validatePoem({
          title,
          author,
          poem,
        });

      if (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError,
        });
      }

      const existing =
        await WisdomPoem.findByPk(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: "Wisdom poem not found.",
        });
      }

      existing.title = title || null;
      existing.author = author || null;
      existing.poem = poem;

      await existing.save();

      return res.json({
        success: true,
        message:
          "Wisdom poem updated successfully.",
        poem: existing,
      });
    } catch (error) {
      console.error(
        "Update wisdom poem error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Unable to update wisdom poem.",
      });
    }
  }
);

/*
 * ADMIN ONLY
 * Delete poem.
 */
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid wisdom poem ID.",
        });
      }

      const existing =
        await WisdomPoem.findByPk(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: "Wisdom poem not found.",
        });
      }

      await existing.destroy();

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

      return res.status(500).json({
        success: false,
        error: "Unable to delete wisdom poem.",
      });
    }
  }
);

module.exports = router;
