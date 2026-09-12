const { User } = require("../models");

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required.",
      });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "role"],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Administrator access required.",
      });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to verify administrator access.",
    });
  }
};

module.exports = adminMiddleware;
