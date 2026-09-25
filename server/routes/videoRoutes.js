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
  Video,
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

const MAX_TITLE_LENGTH = 200;

const MAX_DESCRIPTION_LENGTH =
  5000;

const MAX_VIDEO_SIZE =
  200 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

const VIDEO_STORAGE_ROOT =
  process.env.VIDEO_STORAGE_ROOT ||
  (
    process.env
      .RAILWAY_VOLUME_MOUNT_PATH
      ? path.join(
          process.env
            .RAILWAY_VOLUME_MOUNT_PATH,
          "videos"
        )
      : path.join(
          __dirname,
          "..",
          "storage",
          "videos"
        )
  );

const ensureVideoDirectory =
  async () => {
    await fs.promises.mkdir(
      VIDEO_STORAGE_ROOT,
      {
        recursive: true,
      }
    );
  };

const normalizeTitle =
  (value) =>
    String(value || "").trim();

const normalizeDescription =
  (value) =>
    String(value || "").trim();

const validateVideoText =
  (
    title,
    description
  ) => {
    if (!title) {
      return "Video title is required.";
    }

    if (
      title.length >
      MAX_TITLE_LENGTH
    ) {
      return (
        "Video title must not exceed " +
        `${MAX_TITLE_LENGTH} characters.`
      );
    }

    if (
      description.length >
      MAX_DESCRIPTION_LENGTH
    ) {
      return (
        "Video description must not exceed " +
        `${MAX_DESCRIPTION_LENGTH} characters.`
      );
    }

    return null;
  };

const validateTranslatedVideoText =
  (
    titleDe,
    titleAr,
    descriptionDe,
    descriptionAr
  ) => {
    if (
      titleDe.length >
        MAX_TITLE_LENGTH ||
      titleAr.length >
        MAX_TITLE_LENGTH
    ) {
      return (
        "Translated video titles must not exceed " +
        `${MAX_TITLE_LENGTH} characters.`
      );
    }

    if (
      descriptionDe.length >
        MAX_DESCRIPTION_LENGTH ||
      descriptionAr.length >
        MAX_DESCRIPTION_LENGTH
    ) {
      return (
        "Translated video descriptions must not exceed " +
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
        path.basename(filename) &&
      !filename.includes("..") &&
      !filename.includes("/") &&
      !filename.includes("\\")
    );
  };

const getVideoPath =
  (filename) => {
    if (
      !isSafeFilename(filename)
    ) {
      return null;
    }

    return path.join(
      VIDEO_STORAGE_ROOT,
      filename
    );
  };

const deleteVideoFile =
  async (filename) => {
    const videoPath =
      getVideoPath(filename);

    if (!videoPath) {
      return;
    }

    try {
      await fs.promises.unlink(
        videoPath
      );
    } catch (error) {
      if (
        error.code !== "ENOENT"
      ) {
        console.error(
          "Delete video error:",
          error
        );
      }
    }
  };

const createVideoFilename =
  (file) => {
    const extension =
      ALLOWED_VIDEO_TYPES[
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
    destination: async (
      req,
      file,
      callback
    ) => {
      try {
        await ensureVideoDirectory();

        callback(
          null,
          VIDEO_STORAGE_ROOT
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
      try {
        callback(
          null,
          createVideoFilename(file)
        );
      } catch (error) {
        callback(error);
      }
    },
  });

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        MAX_VIDEO_SIZE,
      files: 1,
    },

    fileFilter: (
      req,
      file,
      callback
    ) => {
      if (
        !ALLOWED_VIDEO_TYPES[
          file.mimetype
        ]
      ) {
        return callback(
          new Error(
            "Only MP4 and WEBM videos are allowed."
          )
        );
      }

      callback(null, true);
    },
  });

const runVideoUpload =
  (
    req,
    res,
    next
  ) => {
    upload.single("video")(
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
                "Video must not exceed 200 MB.",
            });
        }

        return res
          .status(400)
          .json({
            success: false,
            error:
              error.message ||
              "Video upload failed.",
          });
      }
    );
  };

const serializeVideo =
  (record) => {
    const data =
      typeof record?.toJSON ===
      "function"
        ? record.toJSON()
        : record;

    return {
      ...data,

      videoSize:
        data.videoSize == null
          ? null
          : Number(
              data.videoSize
            ),

      videoUrl:
        data.videoFilename
          ? (
              "/videos/stream/" +
              encodeURIComponent(
                data.videoFilename
              )
            )
          : null,
    };
  };

const sendVideoStream =
  async (
    req,
    res
  ) => {
    try {
      const filename =
        req.params.filename;

      if (
        !isSafeFilename(filename)
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Invalid video filename.",
          });
      }

      const video =
        await Video.findOne({
          where: {
            videoFilename:
              filename,
          },
        });

      if (!video) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Video not found.",
          });
      }

      const videoPath =
        getVideoPath(filename);

      let stat;

      try {
        stat =
          await fs.promises.stat(
            videoPath
          );
      } catch (error) {
        if (
          error.code ===
            "ENOENT"
        ) {
          return res
            .status(404)
            .json({
              success: false,
              error:
                "Video file not found.",
            });
        }

        throw error;
      }

      if (!stat.isFile()) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Video file not found.",
          });
      }

      const fileSize =
        stat.size;

      const mimeType =
        video.videoMimeType ||
        "application/octet-stream";

      res.setHeader(
        "Accept-Ranges",
        "bytes"
      );

      res.setHeader(
        "Content-Type",
        mimeType
      );

      const range =
        req.headers.range;

      if (!range) {
        res.status(200);

        res.setHeader(
          "Content-Length",
          fileSize
        );

        return fs
          .createReadStream(
            videoPath
          )
          .pipe(res);
      }

      if (
        !range.startsWith(
          "bytes="
        ) ||
        range.includes(",")
      ) {
        res.status(416);

        res.setHeader(
          "Content-Range",
          `bytes */${fileSize}`
        );

        return res.end();
      }

      const raw =
        range
          .slice(6)
          .split("-");

      const startText =
        raw[0];

      const endText =
        raw[1];

      let start;
      let end;

      if (
        startText === "" &&
        endText !== ""
      ) {
        const suffixLength =
          Number.parseInt(
            endText,
            10
          );

        if (
          !Number.isFinite(
            suffixLength
          ) ||
          suffixLength <= 0
        ) {
          res.status(416);

          res.setHeader(
            "Content-Range",
            `bytes */${fileSize}`
          );

          return res.end();
        }

        start =
          Math.max(
            fileSize -
              suffixLength,
            0
          );

        end =
          fileSize - 1;
      } else {
        start =
          Number.parseInt(
            startText,
            10
          );

        end =
          endText
            ? Number.parseInt(
                endText,
                10
              )
            : fileSize - 1;
      }

      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        start < 0 ||
        end < start ||
        start >= fileSize
      ) {
        res.status(416);

        res.setHeader(
          "Content-Range",
          `bytes */${fileSize}`
        );

        return res.end();
      }

      end =
        Math.min(
          end,
          fileSize - 1
        );

      const chunkSize =
        end - start + 1;

      res.status(206);

      res.setHeader(
        "Content-Range",
        `bytes ${start}-${end}/${fileSize}`
      );

      res.setHeader(
        "Content-Length",
        chunkSize
      );

      return fs
        .createReadStream(
          videoPath,
          {
            start,
            end,
          }
        )
        .pipe(res);
    } catch (error) {
      console.error(
        "Video stream error:",
        error
      );

      if (!res.headersSent) {
        return res
          .status(500)
          .json({
            success: false,
            error:
              "Could not stream video.",
          });
      }

      res.end();
    }
  };

/*
 * PUBLIC
 * Return all videos.
 */
router.get(
  "/",
  async (
    req,
    res
  ) => {
    try {
      const videos =
        await Video.findAll({
          order: [
            [
              "createdAt",
              "DESC",
            ],
          ],
        });

      return res.json({
        success: true,

        videos:
          videos.map(
            serializeVideo
          ),
      });
    } catch (error) {
      console.error(
        "List videos error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Could not load videos.",
        });
    }
  }
);

/*
 * PUBLIC
 * Stream a video.
 * Supports HTTP Range requests
 * so seeking works in the browser.
 */
router.get(
  "/stream/:filename",
  sendVideoStream
);

/*
 * ADMIN
 * Upload a new video.
 */
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  runVideoUpload,
  async (
    req,
    res
  ) => {
    const titleEn =
      normalizeTitle(
        req.body.titleEn ??
          req.body.title
      );

    const titleDe =
      normalizeTitle(
        req.body.titleDe
      );

    const titleAr =
      normalizeTitle(
        req.body.titleAr
      );

    const descriptionEn =
      normalizeDescription(
        req.body.descriptionEn ??
          req.body.description
      );

    const descriptionDe =
      normalizeDescription(
        req.body.descriptionDe
      );

    const descriptionAr =
      normalizeDescription(
        req.body.descriptionAr
      );

    /*
     * Keep legacy title / description
     * synchronized with English.
     */
    const title =
      titleEn;

    const description =
      descriptionEn;

    const validationError =
      validateVideoText(
        title,
        description
      ) ||
      validateTranslatedVideoText(
        titleDe,
        titleAr,
        descriptionDe,
        descriptionAr
      );

    if (validationError) {
      if (req.file) {
        await deleteVideoFile(
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

    if (!req.file) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Please choose an MP4 or WEBM video.",
        });
    }

    try {
      const video =
        await Video.create({
          title,

          description:
            description || null,

          titleEn:
            titleEn || null,

          titleDe:
            titleDe || null,

          titleAr:
            titleAr || null,

          descriptionEn:
            descriptionEn || null,

          descriptionDe:
            descriptionDe || null,

          descriptionAr:
            descriptionAr || null,

          videoFilename:
            req.file.filename,

          videoMimeType:
            req.file.mimetype,

          videoSize:
            req.file.size,
        });

      return res
        .status(201)
        .json({
          success: true,
          video:
            serializeVideo(
              video
            ),
        });
    } catch (error) {
      await deleteVideoFile(
        req.file.filename
      );

      console.error(
        "Create video error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Could not create video.",
        });
    }
  }
);

/*
 * ADMIN
 * Edit title/description and
 * optionally replace video file.
 */
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  runVideoUpload,
  async (
    req,
    res
  ) => {
    let video;

    try {
      video =
        await Video.findByPk(
          req.params.id
        );
    } catch (error) {
      if (req.file) {
        await deleteVideoFile(
          req.file.filename
        );
      }

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Could not load video.",
        });
    }

    if (!video) {
      if (req.file) {
        await deleteVideoFile(
          req.file.filename
        );
      }

      return res
        .status(404)
        .json({
          success: false,
          error:
            "Video not found.",
        });
    }

    const titleEn =
      req.body.titleEn ===
      undefined
        ? (
            video.titleEn ||
            video.title ||
            ""
          )
        : normalizeTitle(
            req.body.titleEn
          );

    const titleDe =
      req.body.titleDe ===
      undefined
        ? (
            video.titleDe ||
            ""
          )
        : normalizeTitle(
            req.body.titleDe
          );

    const titleAr =
      req.body.titleAr ===
      undefined
        ? (
            video.titleAr ||
            ""
          )
        : normalizeTitle(
            req.body.titleAr
          );

    const descriptionEn =
      req.body.descriptionEn ===
      undefined
        ? (
            video.descriptionEn ||
            video.description ||
            ""
          )
        : normalizeDescription(
            req.body.descriptionEn
          );

    const descriptionDe =
      req.body.descriptionDe ===
      undefined
        ? (
            video.descriptionDe ||
            ""
          )
        : normalizeDescription(
            req.body.descriptionDe
          );

    const descriptionAr =
      req.body.descriptionAr ===
      undefined
        ? (
            video.descriptionAr ||
            ""
          )
        : normalizeDescription(
            req.body.descriptionAr
          );

    /*
     * Legacy fields remain English.
     */
    const title =
      titleEn;

    const description =
      descriptionEn;

    const validationError =
      validateVideoText(
        title,
        description
      ) ||
      validateTranslatedVideoText(
        titleDe,
        titleAr,
        descriptionDe,
        descriptionAr
      );

    if (validationError) {
      if (req.file) {
        await deleteVideoFile(
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

    const oldFilename =
      video.videoFilename;

    try {
      video.title =
        title;

      video.description =
        description || null;

      video.titleEn =
        titleEn || null;

      video.titleDe =
        titleDe || null;

      video.titleAr =
        titleAr || null;

      video.descriptionEn =
        descriptionEn || null;

      video.descriptionDe =
        descriptionDe || null;

      video.descriptionAr =
        descriptionAr || null;

      if (req.file) {
        video.videoFilename =
          req.file.filename;

        video.videoMimeType =
          req.file.mimetype;

        video.videoSize =
          req.file.size;
      }

      await video.save();

      if (
        req.file &&
        oldFilename &&
        oldFilename !==
          req.file.filename
      ) {
        await deleteVideoFile(
          oldFilename
        );
      }

      return res.json({
        success: true,

        replacedVideo:
          Boolean(req.file),

        video:
          serializeVideo(
            video
          ),
      });
    } catch (error) {
      if (req.file) {
        await deleteVideoFile(
          req.file.filename
        );
      }

      console.error(
        "Update video error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Could not update video.",
        });
    }
  }
);

/*
 * ADMIN
 * Delete DB record and video file.
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
      const video =
        await Video.findByPk(
          req.params.id
        );

      if (!video) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Video not found.",
          });
      }

      const filename =
        video.videoFilename;

      await video.destroy();

      await deleteVideoFile(
        filename
      );

      return res.json({
        success: true,
      });
    } catch (error) {
      console.error(
        "Delete video error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Could not delete video.",
        });
    }
  }
);

module.exports = router;
