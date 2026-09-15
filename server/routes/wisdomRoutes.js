const express = require("express");
const { Sequelize } = require("sequelize");

const {
  WisdomQuote,
} = require("../models");

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");

const router = express.Router();

const MAX_QUOTE_LENGTH = 1000;

const normalizeQuote = (value) =>
  String(value || "").trim();

const validateQuote = (quote) => {
  if (!quote) {
    return "Wisdom quote is required.";
  }

  if (quote.length > MAX_QUOTE_LENGTH) {
    return `Wisdom quote must not exceed ${MAX_QUOTE_LENGTH} characters.`;
  }

  return null;
};

/*
 * PUBLIC
 * Return one randomly selected quote.
 *
 * This endpoint reads exclusively from the
 * administrator-managed WisdomQuote table.
 */
router.get("/random", async (req, res) => {
  try {
    const quote = await WisdomQuote.findOne({
      order: Sequelize.literal("RANDOM()"),
      attributes: [
        "id",
        "quote",
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
      quote,
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
});

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
        quotes,
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
 * Create a wisdom quote.
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const quote =
        normalizeQuote(req.body.quote);

      const validationError =
        validateQuote(quote);

      if (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError,
        });
      }

      const created =
        await WisdomQuote.create({
          quote,
        });

      return res.status(201).json({
        success: true,
        message:
          "Wisdom quote created successfully.",
        quote: created,
      });
    } catch (error) {
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
 * Edit an existing wisdom quote.
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
          error:
            "Invalid wisdom quote ID.",
        });
      }

      const quote =
        normalizeQuote(req.body.quote);

      const validationError =
        validateQuote(quote);

      if (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError,
        });
      }

      const existing =
        await WisdomQuote.findByPk(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error:
            "Wisdom quote not found.",
        });
      }

      existing.quote = quote;
      await existing.save();

      return res.json({
        success: true,
        message:
          "Wisdom quote updated successfully.",
        quote: existing,
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
 * Delete an existing wisdom quote.
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
          error:
            "Invalid wisdom quote ID.",
        });
      }

      const existing =
        await WisdomQuote.findByPk(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error:
            "Wisdom quote not found.",
        });
      }

      await existing.destroy();

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
