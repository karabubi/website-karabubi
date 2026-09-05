const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const { User } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const AUTH_COOKIE_NAME =
  "websiteKarabubiSession";

const AUTH_COOKIE_MAX_AGE =
  2 * 60 * 60 * 1000;

const authCookieOptions = () => ({
  httpOnly: true,
  secure:
    process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",
  maxAge: AUTH_COOKIE_MAX_AGE,
  path: "/",
});

const setAuthCookie = (res, token) => {
  res.cookie(
    AUTH_COOKIE_NAME,
    token,
    authCookieOptions()
  );
};

const clearAuthCookie = (res) => {
  const {
    maxAge,
    ...options
  } = authCookieOptions();

  res.clearCookie(
    AUTH_COOKIE_NAME,
    options
  );
};

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  username: user.username,
  email: user.email,
  isVerified: user.isVerified,
});

router.post("/register", async (req, res) => {
  try {
    let {
      name,
      username,
      email,
      password,
    } = req.body;

    name = String(name || "").trim();
    username = String(username || "").trim().toLowerCase();
    email = String(email || "")
      .trim()
      .toLowerCase();

    password = String(password || "");

    if (
      !name ||
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        error: "All fields are required.",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        error: "Name must contain at least 2 characters.",
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Username must contain at least 3 characters.",
      });
    }

    const atIndex = email.indexOf("@");
    const lastDotIndex = email.lastIndexOf(".");

    const isValidEmail =
      atIndex > 0 &&
      lastDotIndex > atIndex + 1 &&
      lastDotIndex < email.length - 1;

    if (!isValidEmail) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must contain at least 8 characters.",
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({
          success: false,
          error: "An account with this email already exists.",
        });
      }

      return res.status(409).json({
        success: false,
        error: "This username is already taken.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    const token = createToken(user);

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to create account.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const identifier = String(
      req.body.identifier ||
      req.body.username ||
      req.body.email ||
      ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      req.body.password || ""
    );

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: "Username/email and password are required.",
      });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          {
            username: {
              [Op.iLike]: identifier,
            },
          },
          { email: identifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password.",
      });
    }

    const passwordValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid username/email or password.",
      });
    }

    const token = createToken(user);

    setAuthCookie(res, token);

    return res.json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to sign in.",
    });
  }
});

router.post(
  "/logout",
  (req, res) => {
    clearAuthCookie(res);

    return res.json({
      success: true,
    });
  }
);

router.get(
  "/me",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findByPk(
        req.user.id
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found.",
        });
      }

      return res.json({
        success: true,
        user: publicUser(user),
      });
    } catch (error) {
      console.error("Profile error:", error);

      return res.status(500).json({
        success: false,
        error: "Unable to load user profile.",
      });
    }
  }
);

module.exports = router;
