const jwt = require("jsonwebtoken");

const AUTH_COOKIE_NAME = "websiteKarabubiSession";

const authMiddleware = (req, res, next) => {
  const authorization =
    req.headers.authorization || "";

  const bearerToken =
    authorization.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

  const cookieToken =
    req.cookies?.[AUTH_COOKIE_NAME] || "";

  const token =
    cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error:
        "Invalid or expired authentication token.",
    });
  }
};

module.exports = authMiddleware;
