const express = require("express");
const crypto = require("crypto");
const { Op, fn, col } = require("sequelize");
const { SiteVisit } = require("../models");

const router = express.Router();

const VISIT_WINDOW_MS = 30 * 60 * 1000;

function hashVisitorId(visitorId) {
  return crypto
    .createHash("sha256")
    .update(visitorId)
    .digest("hex");
}

router.post("/visit", async (req, res) => {
  try {
    const { visitorId, path = "/" } = req.body || {};

    if (
      typeof visitorId !== "string" ||
      visitorId.length < 10 ||
      visitorId.length > 200
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid visitor ID.",
      });
    }

    const hashedVisitorId = hashVisitorId(visitorId);

    const windowStart = new Date(
      Date.now() - VISIT_WINDOW_MS
    );

    const recentVisit = await SiteVisit.findOne({
      where: {
        visitorId: hashedVisitorId,
        createdAt: {
          [Op.gte]: windowStart,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    let counted = false;

    if (!recentVisit) {
      await SiteVisit.create({
        visitorId: hashedVisitorId,
        path:
          typeof path === "string"
            ? path.slice(0, 500)
            : "/",
      });

      counted = true;
    }

    return res.json({
      success: true,
      counted,
    });
  } catch (error) {
    console.error("Record site visit error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to record visit.",
    });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalVisits = await SiteVisit.count();

    const uniqueRows = await SiteVisit.findAll({
      attributes: [
        [
          fn(
            "COUNT",
            fn("DISTINCT", col("visitorId"))
          ),
          "count",
        ],
      ],
      raw: true,
    });

    const uniqueVisitors =
      Number(uniqueRows?.[0]?.count) || 0;

    return res.json({
      success: true,
      totalVisits,
      uniqueVisitors,
    });
  } catch (error) {
    console.error("Load visitor stats error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load visitor statistics.",
    });
  }
});

module.exports = router;
