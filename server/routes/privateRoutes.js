const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const authMiddleware = require("../middleware/authMiddleware");
const { User } = require("../models");

const router = express.Router();

const STORAGE_ROOT =
  process.env.PRIVATE_PHOTO_STORAGE_ROOT ||
  (process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(
        process.env.RAILWAY_VOLUME_MOUNT_PATH,
        "private-photos"
      )
    : path.join(
        __dirname,
        "..",
        "storage",
        "private-photos"
      ));

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES_PER_UPLOAD = 10;

// =====================================================
// Private documents
// =====================================================

const DOCUMENT_STORAGE_ROOT =
  process.env.PRIVATE_DOCUMENT_STORAGE_ROOT ||
  (process.env.RAILWAY_VOLUME_MOUNT_PATH
    ? path.join(
        process.env.RAILWAY_VOLUME_MOUNT_PATH,
        "private-documents"
      )
    : path.join(
        __dirname,
        "..",
        "storage",
        "private-documents"
      ));

const DOCUMENT_MAX_FILE_SIZE = 20 * 1024 * 1024;
const DOCUMENT_MAX_FILES_PER_UPLOAD = 10;

const ALLOWED_DOCUMENT_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".txt",
]);

const DOCUMENT_MIME_TYPES = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".csv": "text/csv",
  ".txt": "text/plain",
};

function getUserDocumentDirectory(userId) {
  const directory = path.join(
    DOCUMENT_STORAGE_ROOT,
    String(userId)
  );

  ensureDirectory(directory);

  return directory;
}

function getDocumentMimeType(filename) {
  const extension =
    path.extname(filename).toLowerCase();

  return (
    DOCUMENT_MIME_TYPES[extension] ||
    "application/octet-stream"
  );
}

function isAllowedDocument(file) {
  const extension =
    path.extname(file.originalname || "").toLowerCase();

  if (!ALLOWED_DOCUMENT_EXTENSIONS.has(extension)) {
    return false;
  }

  const expectedMime = DOCUMENT_MIME_TYPES[extension];

  // Some browsers/OSes send generic MIME values for
  // Office documents, CSV or text files. Extension is
  // therefore also validated independently.
  const acceptedGenericTypes = new Set([
    "application/octet-stream",
    "application/zip",
    "application/x-zip-compressed",
  ]);

  return (
    file.mimetype === expectedMime ||
    acceptedGenericTypes.has(file.mimetype) ||
    (extension === ".csv" &&
      [
        "text/csv",
        "application/csv",
        "text/plain",
        "application/vnd.ms-excel",
      ].includes(file.mimetype)) ||
    (extension === ".txt" &&
      [
        "text/plain",
        "application/octet-stream",
      ].includes(file.mimetype))
  );
}

function documentToResponse(file) {
  const encoded =
    encodeURIComponent(file.filename);

  return {
    id: file.filename,
    filename: extractOriginalName(file.filename),
    storedFilename: file.filename,
    size: file.size,
    mimeType:
      file.mimetype ||
      getDocumentMimeType(file.filename),
    uploadedAt: file.birthtime.toISOString(),
    updatedAt: file.mtime.toISOString(),
    downloadUrl:
      `/private/documents/${encoded}/download`,
  };
}

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      cb(
        null,
        getUserDocumentDirectory(req.user.id)
      );
    } catch (error) {
      cb(error);
    }
  },

  filename: (req, file, cb) => {
    cb(
      null,
      storedFilename(file.originalname)
    );
  },
});

const documentUpload = multer({
  storage: documentStorage,

  limits: {
    fileSize: DOCUMENT_MAX_FILE_SIZE,
    files: DOCUMENT_MAX_FILES_PER_UPLOAD,
  },

  fileFilter: (req, file, cb) => {
    if (!isAllowedDocument(file)) {
      return cb(
        new Error(
          "Only PDF, DOC, DOCX, XLS, XLSX, CSV and TXT documents are allowed."
        )
      );
    }

    return cb(null, true);
  },
});


function ensureDirectory(directory) {
  fs.mkdirSync(directory, {
    recursive: true,
  });
}

function getUserDirectory(userId) {
  const directory = path.join(
    STORAGE_ROOT,
    String(userId)
  );

  ensureDirectory(directory);

  return directory;
}

function sanitizeOriginalName(value) {
  const extension =
    path.extname(value || "").toLowerCase();

  const base =
    path
      .basename(value || "photo", extension)
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 90) || "photo";

  return `${base}${extension}`;
}

function storedFilename(originalName) {
  return [
    Date.now(),
    crypto.randomUUID(),
    sanitizeOriginalName(originalName),
  ].join("__");
}

function extractOriginalName(filename) {
  const pieces = filename.split("__");

  if (pieces.length >= 3) {
    return pieces.slice(2).join("__");
  }

  return filename;
}

function validateStoredFilename(filename) {
  return (
    filename &&
    filename === path.basename(filename) &&
    !filename.includes("..") &&
    !filename.includes("/") &&
    !filename.includes("\\")
  );
}

function fileToPhoto(file, req) {
  const encoded =
    encodeURIComponent(file.filename);

  return {
    id: file.filename,
    filename: extractOriginalName(file.filename),
    storedFilename: file.filename,
    size: file.size,
    mimeType: file.mimetype,
    uploadedAt: file.birthtime.toISOString(),
    updatedAt: file.mtime.toISOString(),
    viewUrl:
      `/private/photos/${encoded}/view`,
    downloadUrl:
      `/private/photos/${encoded}/download`,
  };
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      cb(
        null,
        getUserDirectory(req.user.id)
      );
    } catch (error) {
      cb(error);
    }
  },

  filename: (req, file, cb) => {
    cb(
      null,
      storedFilename(file.originalname)
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_UPLOAD,
  },

  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new Error(
          "Only JPG, PNG and WEBP images are allowed."
        )
      );
    }

    return cb(null, true);
  },
});

router.get(
  "/dashboard",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findByPk(
        req.user.id,
        {
          attributes: [
            "id",
            "name",
            "username",
            "email",
          ],
        }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found.",
        });
      }

      return res.json({
        success: true,
        message:
          `Welcome to your private dashboard, ${user.name}!`,
        user,
      });
    } catch (error) {
      console.error(
        "Private dashboard error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Unable to load dashboard.",
      });
    }
  }
);


router.get(
  "/documents",
  authMiddleware,
  async (req, res) => {
    try {
      const directory =
        getUserDocumentDirectory(req.user.id);

      const entries = await fs.promises.readdir(
        directory,
        {
          withFileTypes: true,
        }
      );

      const documents = [];

      for (const entry of entries) {
        if (
          !entry.isFile() ||
          entry.name.startsWith(".")
        ) {
          continue;
        }

        if (!validateStoredFilename(entry.name)) {
          continue;
        }

        const extension =
          path.extname(
            extractOriginalName(entry.name)
          ).toLowerCase();

        if (
          !ALLOWED_DOCUMENT_EXTENSIONS.has(
            extension
          )
        ) {
          continue;
        }

        const fullPath =
          path.join(directory, entry.name);

        const stats =
          await fs.promises.stat(fullPath);

        documents.push(
          documentToResponse({
            filename: entry.name,
            size: stats.size,
            mimetype:
              getDocumentMimeType(entry.name),
            birthtime: stats.birthtime,
            mtime: stats.mtime,
          })
        );
      }

      documents.sort(
        (a, b) =>
          new Date(b.uploadedAt) -
          new Date(a.uploadedAt)
      );

      return res.json({
        success: true,
        count: documents.length,
        documents,
      });
    } catch (error) {
      console.error(
        "List private documents error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Unable to load documents.",
      });
    }
  }
);

router.post(
  "/documents",
  authMiddleware,
  documentUpload.array(
    "documents",
    DOCUMENT_MAX_FILES_PER_UPLOAD
  ),
  async (req, res) => {
    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({
        success: false,
        error:
          "Please select at least one document.",
      });
    }

    const documents = files.map((file) =>
      documentToResponse({
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        birthtime: new Date(),
        mtime: new Date(),
      })
    );

    return res.status(201).json({
      success: true,
      message:
        `${documents.length} document${
          documents.length === 1 ? "" : "s"
        } uploaded successfully.`,
      documents,
    });
  }
);

router.get(
  "/documents/:filename/download",
  authMiddleware,
  async (req, res) => {
    try {
      const filename =
        String(req.params.filename || "");

      if (!validateStoredFilename(filename)) {
        return res.status(400).json({
          success: false,
          error: "Invalid document filename.",
        });
      }

      const directory =
        getUserDocumentDirectory(req.user.id);

      const filePath =
        path.join(directory, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: "Document not found.",
        });
      }

      const originalName =
        extractOriginalName(filename);

      const extension =
        path.extname(
          originalName
        ).toLowerCase();

      if (
        !ALLOWED_DOCUMENT_EXTENSIONS.has(
          extension
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid document type.",
        });
      }

      res.setHeader(
        "Cache-Control",
        "private, no-store"
      );

      res.type(
        getDocumentMimeType(originalName)
      );

      return res.download(
        filePath,
        originalName
      );
    } catch (error) {
      console.error(
        "Download private document error:",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: "Unable to download document.",
        });
      }
    }
  }
);

router.patch(
  "/documents/:filename/rename",
  authMiddleware,
  async (req, res) => {
    try {
      const filename =
        String(req.params.filename || "");

      if (!validateStoredFilename(filename)) {
        return res.status(400).json({
          success: false,
          error: "Invalid document filename.",
        });
      }

      const requestedName =
        String(req.body?.filename || "").trim();

      if (!requestedName) {
        return res.status(400).json({
          success: false,
          error: "New document filename is required.",
        });
      }

      if (
        requestedName !== path.basename(requestedName) ||
        requestedName.includes("..") ||
        requestedName.includes("/") ||
        requestedName.includes("\\")
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid new document filename.",
        });
      }

      const currentOriginalName =
        extractOriginalName(filename);

      const currentExtension =
        path.extname(currentOriginalName).toLowerCase();

      const requestedExtension =
        path.extname(requestedName).toLowerCase();

      if (
        !ALLOWED_DOCUMENT_EXTENSIONS.has(
          currentExtension
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid current document type.",
        });
      }

      if (
        !ALLOWED_DOCUMENT_EXTENSIONS.has(
          requestedExtension
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid new document type.",
        });
      }

      if (
        requestedExtension !== currentExtension
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Changing the document file extension is not allowed.",
        });
      }

      const sanitizedNewName =
        sanitizeOriginalName(requestedName);

      if (
        path.extname(
          sanitizedNewName
        ).toLowerCase() !== currentExtension
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid renamed document.",
        });
      }

      const directory =
        getUserDocumentDirectory(req.user.id);

      const oldPath =
        path.join(directory, filename);

      if (!fs.existsSync(oldPath)) {
        return res.status(404).json({
          success: false,
          error: "Document not found.",
        });
      }

      const newStoredFilename =
        storedFilename(sanitizedNewName);

      const newPath =
        path.join(
          directory,
          newStoredFilename
        );

      if (fs.existsSync(newPath)) {
        return res.status(409).json({
          success: false,
          error:
            "A document with that filename already exists.",
        });
      }

      await fs.promises.rename(
        oldPath,
        newPath
      );

      const stats =
        await fs.promises.stat(newPath);

      return res.json({
        success: true,
        message:
          "Document renamed successfully.",
        document:
          documentToResponse({
            filename: newStoredFilename,
            size: stats.size,
            mimetype:
              getDocumentMimeType(
                sanitizedNewName
              ),
            birthtime: stats.birthtime,
            mtime: stats.mtime,
          }),
      });
    } catch (error) {
      console.error(
        "Rename private document error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Unable to rename document.",
      });
    }
  }
);

router.delete(
  "/documents/:filename",
  authMiddleware,
  async (req, res) => {
    try {
      const filename =
        String(req.params.filename || "");

      if (!validateStoredFilename(filename)) {
        return res.status(400).json({
          success: false,
          error: "Invalid document filename.",
        });
      }

      const directory =
        getUserDocumentDirectory(req.user.id);

      const filePath =
        path.join(directory, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: "Document not found.",
        });
      }

      const originalName =
        extractOriginalName(filename);

      const extension =
        path.extname(
          originalName
        ).toLowerCase();

      if (
        !ALLOWED_DOCUMENT_EXTENSIONS.has(
          extension
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid document type.",
        });
      }

      await fs.promises.unlink(filePath);

      return res.json({
        success: true,
        message:
          "Document deleted successfully.",
        filename: originalName,
        storedFilename: filename,
      });
    } catch (error) {
      console.error(
        "Delete private document error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Unable to delete document.",
      });
    }
  }
);

router.get(
  "/photos",
  authMiddleware,
  async (req, res) => {
    try {
      const directory =
        getUserDirectory(req.user.id);

      const entries = await fs.promises.readdir(
        directory,
        {
          withFileTypes: true,
        }
      );

      const photos = [];

      for (const entry of entries) {
        if (
          !entry.isFile() ||
          entry.name.startsWith(".")
        ) {
          continue;
        }

        const fullPath =
          path.join(directory, entry.name);

        const stats =
          await fs.promises.stat(fullPath);

        photos.push(
          fileToPhoto(
            {
              filename: entry.name,
              size: stats.size,
              mimetype:
                getMimeType(entry.name),
              birthtime: stats.birthtime,
              mtime: stats.mtime,
            },
            req
          )
        );
      }

      photos.sort(
        (a, b) =>
          new Date(b.uploadedAt) -
          new Date(a.uploadedAt)
      );

      return res.json({
        success: true,
        count: photos.length,
        photos,
      });
    } catch (error) {
      console.error(
        "List private photos error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Unable to load photos.",
      });
    }
  }
);

router.post(
  "/photos",
  authMiddleware,
  upload.array(
    "photos",
    MAX_FILES_PER_UPLOAD
  ),
  async (req, res) => {
    const files = req.files || [];

    if (!files.length) {
      return res.status(400).json({
        success: false,
        error: "Please select at least one photo.",
      });
    }

    const photos = files.map((file) => ({
      id: file.filename,
      filename:
        extractOriginalName(file.filename),
      storedFilename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString(),
      viewUrl:
        `/private/photos/${encodeURIComponent(
          file.filename
        )}/view`,
      downloadUrl:
        `/private/photos/${encodeURIComponent(
          file.filename
        )}/download`,
    }));

    return res.status(201).json({
      success: true,
      message:
        `${photos.length} photo${
          photos.length === 1 ? "" : "s"
        } uploaded successfully.`,
      photos,
    });
  }
);

router.get(
  "/photos/:filename/view",
  authMiddleware,
  async (req, res) => {
    const filename =
      String(req.params.filename || "");

    if (!validateStoredFilename(filename)) {
      return res.status(400).json({
        success: false,
        error: "Invalid photo filename.",
      });
    }

    const directory =
      getUserDirectory(req.user.id);

    const filePath =
      path.resolve(directory, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "Photo not found.",
      });
    }

    res.setHeader(
      "Cache-Control",
      "private, no-store"
    );

    res.type(getMimeType(filename));

    return res.sendFile(filePath, (error) => {
      if (error) {
        console.error(
          "View private photo error:",
          error
        );

        if (!res.headersSent) {
          return res.status(
            error.statusCode || 500
          ).json({
            success: false,
            error: "Unable to load photo.",
          });
        }
      }
    });
  }
);

router.get(
  "/photos/:filename/download",
  authMiddleware,
  async (req, res) => {
    const filename =
      String(req.params.filename || "");

    if (!validateStoredFilename(filename)) {
      return res.status(400).json({
        success: false,
        error: "Invalid photo filename.",
      });
    }

    const directory =
      getUserDirectory(req.user.id);

    const filePath =
      path.join(directory, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "Photo not found.",
      });
    }

    const originalName =
      extractOriginalName(filename);

    return res.download(
      filePath,
      originalName
    );
  }
);

function getMimeType(filename) {
  const extension =
    path.extname(filename).toLowerCase();

  if (
    extension === ".jpg" ||
    extension === ".jpeg"
  ) {
    return "image/jpeg";
  }

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  return "application/octet-stream";
}

router.patch(
  "/photos/:filename",
  authMiddleware,
  async (req, res) => {
    try {
      const filename =
        String(req.params.filename || "");

      if (!validateStoredFilename(filename)) {
        return res.status(400).json({
          success: false,
          error: "Invalid photo filename.",
        });
      }

      const requestedName =
        String(req.body.filename || "").trim();

      if (!requestedName) {
        return res.status(400).json({
          success: false,
          error: "A photo name is required.",
        });
      }

      if (requestedName.length > 120) {
        return res.status(400).json({
          success: false,
          error:
            "Photo name must contain 120 characters or fewer.",
        });
      }

      const directory =
        getUserDirectory(req.user.id);

      const oldPath =
        path.join(directory, filename);

      if (!fs.existsSync(oldPath)) {
        return res.status(404).json({
          success: false,
          error: "Photo not found.",
        });
      }

      const originalExtension =
        path.extname(
          extractOriginalName(filename)
        ).toLowerCase();

      let requestedBase =
        path.basename(
          requestedName,
          path.extname(requestedName)
        );

      requestedBase =
        requestedBase
          .replace(/[^a-zA-Z0-9._ -]+/g, "-")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 90);

      if (!requestedBase) {
        return res.status(400).json({
          success: false,
          error: "Please enter a valid photo name.",
        });
      }

      const parts = filename.split("__");

      if (parts.length < 3) {
        return res.status(400).json({
          success: false,
          error:
            "This photo cannot be renamed safely.",
        });
      }

      const prefix =
        `${parts[0]}__${parts[1]}__`;

      const cleanDisplayName =
        `${requestedBase}${originalExtension}`;

      const newStoredFilename =
        `${prefix}${cleanDisplayName}`;

      if (
        newStoredFilename === filename
      ) {
        return res.json({
          success: true,
          message: "Photo name unchanged.",
          photo: {
            id: filename,
            filename:
              extractOriginalName(filename),
          },
        });
      }

      const newPath =
        path.join(
          directory,
          newStoredFilename
        );

      if (fs.existsSync(newPath)) {
        return res.status(409).json({
          success: false,
          error:
            "A photo with this name already exists.",
        });
      }

      await fs.promises.rename(
        oldPath,
        newPath
      );

      const stats =
        await fs.promises.stat(newPath);

      const photo =
        fileToPhoto(
          {
            filename: newStoredFilename,
            size: stats.size,
            mimetype:
              getMimeType(newStoredFilename),
            birthtime: stats.birthtime,
            mtime: stats.mtime,
          },
          req
        );

      return res.json({
        success: true,
        message:
          `Photo renamed to ${cleanDisplayName}.`,
        photo,
      });
    } catch (error) {
      console.error(
        "Rename private photo error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Unable to rename photo.",
      });
    }
  }
);

router.delete(
  "/photos/:filename",
  authMiddleware,
  async (req, res) => {
    try {
      const filename =
        String(req.params.filename || "");

      if (!validateStoredFilename(filename)) {
        return res.status(400).json({
          success: false,
          error: "Invalid photo filename.",
        });
      }

      const directory =
        getUserDirectory(req.user.id);

      const filePath =
        path.join(directory, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: "Photo not found.",
        });
      }

      const originalName =
        extractOriginalName(filename);

      await fs.promises.unlink(filePath);

      return res.json({
        success: true,
        message:
          `${originalName} deleted successfully.`,
      });
    } catch (error) {
      console.error(
        "Delete private photo error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: "Unable to delete photo.",
      });
    }
  }
);


router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error:
          "Each photo must be 10 MB or smaller.",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error:
          "You can upload up to 10 photos at once.",
      });
    }

    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      error:
        error.message ||
        "Unable to process photo upload.",
    });
  }

  return next();
});

module.exports = router;
