import { Hono } from "hono";
import { cors } from "hono/cors";
import pg from "pg";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const { Client } = pg;

const app = new Hono();

const VISIT_WINDOW_MS = 30 * 60 * 1000;

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function withDb(c, callback) {
  const client = new Client({
    connectionString: c.env.HYPERDRIVE.connectionString
  });

  try {
    await client.connect();
    return await callback(client);
  } finally {
    await client.end().catch(() => {});
  }
}

app.use(
  "/api/*",
  cors({
    origin: [
      "https://saleh-alkarabubi.site",
      "https://www.saleh-alkarabubi.site",
      "http://localhost:5173"
    ],
    allowHeaders: [
      "Content-Type",
      "Authorization"
    ],
    allowMethods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],
    credentials: true
  })
);

app.get("/", (c) => {
  return c.json({
    status: "online",
    service: "website-karabubi-cloudflare-api"
  });
});

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    service: "website-karabubi-api",
    platform: "Cloudflare Workers"
  });
});

app.get("/api/db-health", async (c) => {
  try {
    return await withDb(c, async (client) => {
      const result = await client.query(`
        SELECT
          current_database() AS database,
          current_user AS user,
          NOW() AS time
      `);

      return c.json({
        status: "ok",
        database: "connected",
        result: result.rows[0]
      });
    });
  } catch (error) {
    console.error("Database error:", error);

    return c.json(
      {
        status: "error",
        database: "connection failed",
        message: error.message
      },
      500
    );
  }
});

app.post("/api/analytics/visit", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));

    const {
      visitorId,
      path = "/"
    } = body;

    if (
      typeof visitorId !== "string" ||
      visitorId.length < 10 ||
      visitorId.length > 200
    ) {
      return c.json(
        {
          success: false,
          error: "Invalid visitor ID."
        },
        400
      );
    }

    const hashedVisitorId =
      await sha256Hex(visitorId);

    const windowStart = new Date(
      Date.now() - VISIT_WINDOW_MS
    );

    return await withDb(c, async (client) => {
      const recentVisit = await client.query(
        `
        SELECT id
        FROM site_visits
        WHERE "visitorId" = $1
          AND "createdAt" >= $2
        ORDER BY "createdAt" DESC
        LIMIT 1
        `,
        [
          hashedVisitorId,
          windowStart
        ]
      );

      let counted = false;

      if (recentVisit.rowCount === 0) {
        await client.query(
          `
          INSERT INTO site_visits
            ("visitorId", path, "createdAt", "updatedAt")
          VALUES
            ($1, $2, NOW(), NOW())
          `,
          [
            hashedVisitorId,
            typeof path === "string"
              ? path.slice(0, 500)
              : "/"
          ]
        );

        counted = true;
      }

      return c.json({
        success: true,
        counted
      });
    });
  } catch (error) {
    console.error(
      "Record site visit error:",
      error
    );

    return c.json(
      {
        success: false,
        error: "Unable to record visit."
      },
      500
    );
  }
});

app.get("/api/analytics/stats", async (c) => {
  try {
    return await withDb(c, async (client) => {
      const result = await client.query(`
        SELECT
          COUNT(*)::int AS "totalVisits",
          COUNT(DISTINCT "visitorId")::int
            AS "uniqueVisitors"
        FROM site_visits
      `);

      return c.json({
        success: true,
        totalVisits:
          result.rows[0]?.totalVisits || 0,
        uniqueVisitors:
          result.rows[0]?.uniqueVisitors || 0
      });
    });
  } catch (error) {
    console.error(
      "Load visitor stats error:",
      error
    );

    return c.json(
      {
        success: false,
        error:
          "Unable to load visitor statistics."
      },
      500
    );
  }
});

app.get("/api/r2-health", async (c) => {
  try {
    const result = await c.env.MEDIA.list({
      limit: 1
    });

    return c.json({
      status: "ok",
      storage: "Cloudflare R2",
      bucket: "connected",
      objectsChecked: result.objects.length
    });
  } catch (error) {
    console.error("R2 health check failed:", error);

    return c.json(
      {
        status: "error",
        storage: "Cloudflare R2",
        bucket: "connection failed"
      },
      500
    );
  }
});

app.get("/api/wisdom/images/:filename", async (c) => {
  const filename = c.req.param("filename");

  if (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return c.json(
      {
        success: false,
        error: "Wisdom image not found."
      },
      404
    );
  }

  try {
    const object = await c.env.MEDIA.get(
      `wisdom/${filename}`
    );

    if (!object) {
      return c.json(
        {
          success: false,
          error: "Wisdom image not found."
        },
        404
      );
    }

    const headers = new Headers();

    object.writeHttpMetadata(headers);

    if (!headers.has("Content-Type")) {
      headers.set(
        "Content-Type",
        "application/octet-stream"
      );
    }

    headers.set(
      "Cache-Control",
      "public, max-age=3600"
    );

    if (object.httpEtag) {
      headers.set("ETag", object.httpEtag);
    }

    return new Response(object.body, {
      headers
    });
  } catch (error) {
    console.error(
      "Wisdom image R2 error:",
      error
    );

    return c.json(
      {
        success: false,
        error: "Unable to load wisdom image."
      },
      500
    );
  }
});

app.get("/api/wisdom/random", async (c) => {
  try {
    return await withDb(c, async (client) => {
      const result = await client.query(`
        SELECT
          id,
          quote,
          "imageFilename"
        FROM wisdom_quotes
        ORDER BY RANDOM()
        LIMIT 1
      `);

      if (result.rowCount === 0) {
        return c.json(
          {
            success: false,
            error: "No wisdom quotes are available yet."
          },
          404
        );
      }

      const quote = result.rows[0];

      return c.json({
        success: true,
        quote: {
          ...quote,
          imageUrl: quote.imageFilename
            ? `/wisdom/images/${encodeURIComponent(
                quote.imageFilename
              )}`
            : null
        }
      });
    });
  } catch (error) {
    console.error(
      "Random wisdom quote error:",
      error
    );

    return c.json(
      {
        success: false,
        error: "Unable to load a wisdom quote."
      },
      500
    );
  }
});


// =====================================================
// Wisdom admin CRUD
// =====================================================

const WISDOM_MAX_QUOTE_LENGTH = 1000;
const WISDOM_MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const WISDOM_IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

const normalizeWisdomQuote = (value) =>
  String(value || "").trim();

const normalizeWisdomBoolean = (value) =>
  value === true ||
  value === 1 ||
  value === "1" ||
  String(value || "")
    .toLowerCase() === "true";

const validateWisdomQuote = (quote) => {
  if (!quote) {
    return "Wisdom quote is required.";
  }

  if (
    quote.length >
    WISDOM_MAX_QUOTE_LENGTH
  ) {
    return (
      "Wisdom quote must not exceed " +
      `${WISDOM_MAX_QUOTE_LENGTH} characters.`
    );
  }

  return null;
};

const wisdomImageUrl = (filename) =>
  filename
    ? `/wisdom/images/${encodeURIComponent(
        filename
      )}`
    : null;

const wisdomPublicRecord = (row) => ({
  ...row,
  imageUrl:
    wisdomImageUrl(
      row.imageFilename
    )
});

const createWisdomImageFilename =
  (file) => {
    const extension =
      WISDOM_IMAGE_TYPES[
        file.type
      ];

    return (
      Date.now() +
      "-" +
      crypto.randomUUID() +
      extension
    );
  };

const validateWisdomImage =
  (file) => {
    if (!file) {
      return null;
    }

    if (
      !WISDOM_IMAGE_TYPES[
        file.type
      ]
    ) {
      return (
        "Only JPG, PNG and WEBP images are allowed."
      );
    }

    if (
      file.size >
      WISDOM_MAX_IMAGE_SIZE
    ) {
      return (
        "Image must not exceed 10 MB."
      );
    }

    return null;
  };

app.get(
  "/api/wisdom/",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    try {
      return await withDb(
        c,
        async (client) => {
          const result =
            await client.query(`
              SELECT
                id,
                quote,
                "imageFilename",
                "createdAt",
                "updatedAt"
              FROM wisdom_quotes
              ORDER BY
                "createdAt" DESC,
                id DESC
            `);

          return c.json({
            success: true,
            quotes:
              result.rows.map(
                wisdomPublicRecord
              )
          });
        }
      );
    } catch (error) {
      console.error(
        "Wisdom quote list error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to load wisdom quotes."
        },
        500
      );
    }
  }
);

app.post(
  "/api/wisdom/",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    let uploadedFilename = null;

    try {
      const form =
        await c.req.formData();

      const quote =
        normalizeWisdomQuote(
          form.get("quote")
        );

      const validationError =
        validateWisdomQuote(quote);

      if (validationError) {
        return c.json(
          {
            success: false,
            error: validationError
          },
          400
        );
      }

      const imageValue =
        form.get("image");

      const image =
        imageValue instanceof File &&
        imageValue.size > 0
          ? imageValue
          : null;

      const imageError =
        validateWisdomImage(image);

      if (imageError) {
        return c.json(
          {
            success: false,
            error: imageError
          },
          400
        );
      }

      if (image) {
        uploadedFilename =
          createWisdomImageFilename(
            image
          );

        await c.env.MEDIA.put(
          `wisdom/${uploadedFilename}`,
          image.stream(),
          {
            httpMetadata: {
              contentType:
                image.type
            }
          }
        );
      }

      return await withDb(
        c,
        async (client) => {
          try {
            const result =
              await client.query(
                `
                  INSERT INTO wisdom_quotes
                  (
                    quote,
                    "imageFilename",
                    "createdAt",
                    "updatedAt"
                  )
                  VALUES
                  (
                    $1,
                    $2,
                    NOW(),
                    NOW()
                  )
                  RETURNING
                    id,
                    quote,
                    "imageFilename",
                    "createdAt",
                    "updatedAt"
                `,
                [
                  quote,
                  uploadedFilename
                ]
              );

            return c.json(
              {
                success: true,
                message:
                  "Wisdom quote created successfully.",
                quote:
                  wisdomPublicRecord(
                    result.rows[0]
                  )
              },
              201
            );
          } catch (error) {
            if (uploadedFilename) {
              await c.env.MEDIA
                .delete(
                  `wisdom/${uploadedFilename}`
                )
                .catch(() => {});
            }

            throw error;
          }
        }
      );
    } catch (error) {
      if (uploadedFilename) {
        await c.env.MEDIA
          .delete(
            `wisdom/${uploadedFilename}`
          )
          .catch(() => {});
      }

      console.error(
        "Create wisdom quote error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to create wisdom quote."
        },
        500
      );
    }
  }
);

app.patch(
  "/api/wisdom/:id",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    const id =
      Number(
        c.req.param("id")
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return c.json(
        {
          success: false,
          error:
            "Invalid wisdom quote ID."
        },
        400
      );
    }

    let uploadedFilename = null;

    try {
      const form =
        await c.req.formData();

      const quote =
        normalizeWisdomQuote(
          form.get("quote")
        );

      const validationError =
        validateWisdomQuote(quote);

      if (validationError) {
        return c.json(
          {
            success: false,
            error: validationError
          },
          400
        );
      }

      const removeImage =
        normalizeWisdomBoolean(
          form.get("removeImage")
        );

      const imageValue =
        form.get("image");

      const image =
        imageValue instanceof File &&
        imageValue.size > 0
          ? imageValue
          : null;

      const imageError =
        validateWisdomImage(image);

      if (imageError) {
        return c.json(
          {
            success: false,
            error: imageError
          },
          400
        );
      }

      return await withDb(
        c,
        async (client) => {
          const existingResult =
            await client.query(
              `
                SELECT
                  id,
                  quote,
                  "imageFilename",
                  "createdAt",
                  "updatedAt"
                FROM wisdom_quotes
                WHERE id = $1
                LIMIT 1
              `,
              [id]
            );

          if (
            existingResult.rowCount ===
            0
          ) {
            return c.json(
              {
                success: false,
                error:
                  "Wisdom quote not found."
              },
              404
            );
          }

          const existing =
            existingResult.rows[0];

          const oldImageFilename =
            existing.imageFilename;

          let nextImageFilename =
            oldImageFilename;

          if (image) {
            uploadedFilename =
              createWisdomImageFilename(
                image
              );

            await c.env.MEDIA.put(
              `wisdom/${uploadedFilename}`,
              image.stream(),
              {
                httpMetadata: {
                  contentType:
                    image.type
                }
              }
            );

            nextImageFilename =
              uploadedFilename;
          } else if (removeImage) {
            nextImageFilename = null;
          }

          try {
            const result =
              await client.query(
                `
                  UPDATE wisdom_quotes
                  SET
                    quote = $1,
                    "imageFilename" = $2,
                    "updatedAt" = NOW()
                  WHERE id = $3
                  RETURNING
                    id,
                    quote,
                    "imageFilename",
                    "createdAt",
                    "updatedAt"
                `,
                [
                  quote,
                  nextImageFilename,
                  id
                ]
              );

            if (
              oldImageFilename &&
              oldImageFilename !==
                nextImageFilename
            ) {
              const oldImageKey =
                `wisdom/${oldImageFilename}`;

              await c.env.MEDIA.delete(
                oldImageKey
              );

              // Verify the object was really removed.
              // Retry once if it is still present.
              let remainingObject =
                await c.env.MEDIA.head(
                  oldImageKey
                );

              if (remainingObject) {
                console.warn(
                  "Wisdom image still existed after first delete; retrying:",
                  oldImageKey
                );

                await c.env.MEDIA.delete(
                  oldImageKey
                );

                remainingObject =
                  await c.env.MEDIA.head(
                    oldImageKey
                  );

                if (remainingObject) {
                  throw new Error(
                    "Unable to remove old wisdom image from R2."
                  );
                }
              }
            }

            return c.json({
              success: true,
              message:
                "Wisdom quote updated successfully.",
              quote:
                wisdomPublicRecord(
                  result.rows[0]
                )
            });
          } catch (error) {
            if (uploadedFilename) {
              await c.env.MEDIA
                .delete(
                  `wisdom/${uploadedFilename}`
                )
                .catch(() => {});
            }

            throw error;
          }
        }
      );
    } catch (error) {
      console.error(
        "Update wisdom quote error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to update wisdom quote."
        },
        500
      );
    }
  }
);

app.delete(
  "/api/wisdom/:id",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    const id =
      Number(
        c.req.param("id")
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return c.json(
        {
          success: false,
          error:
            "Invalid wisdom quote ID."
        },
        400
      );
    }

    try {
      return await withDb(
        c,
        async (client) => {
          const existingResult =
            await client.query(
              `
                SELECT
                  id,
                  "imageFilename"
                FROM wisdom_quotes
                WHERE id = $1
                LIMIT 1
              `,
              [id]
            );

          if (
            existingResult.rowCount ===
            0
          ) {
            return c.json(
              {
                success: false,
                error:
                  "Wisdom quote not found."
              },
              404
            );
          }

          const imageFilename =
            existingResult.rows[0]
              .imageFilename;

          await client.query(
            `
              DELETE FROM wisdom_quotes
              WHERE id = $1
            `,
            [id]
          );

          if (imageFilename) {
            await c.env.MEDIA
              .delete(
                `wisdom/${imageFilename}`
              )
              .catch(
                (deleteError) => {
                  console.error(
                    "Delete wisdom image error:",
                    deleteError
                  );
                }
              );
          }

          return c.json({
            success: true,
            message:
              "Wisdom quote deleted successfully."
          });
        }
      );
    } catch (error) {
      console.error(
        "Delete wisdom quote error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to delete wisdom quote."
        },
        500
      );
    }
  }
);



// =====================================================
// Wisdom Poetry admin CRUD
// =====================================================

const POETRY_MAX_TITLE_LENGTH = 200;
const POETRY_MAX_AUTHOR_LENGTH = 200;
const POETRY_MAX_POEM_LENGTH = 5000;
const POETRY_MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const POETRY_IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

const normalizePoetryText = (value) =>
  String(value || "").trim();

const normalizePoetryBoolean = (value) =>
  String(value || "")
    .toLowerCase() === "true";

const validatePoetry = ({
  title,
  author,
  poem
}) => {
  if (!poem) {
    return "Poem text is required.";
  }

  if (
    poem.length >
    POETRY_MAX_POEM_LENGTH
  ) {
    return (
      "Poem must not exceed " +
      `${POETRY_MAX_POEM_LENGTH} characters.`
    );
  }

  if (
    title.length >
    POETRY_MAX_TITLE_LENGTH
  ) {
    return (
      "Title must not exceed " +
      `${POETRY_MAX_TITLE_LENGTH} characters.`
    );
  }

  if (
    author.length >
    POETRY_MAX_AUTHOR_LENGTH
  ) {
    return (
      "Author must not exceed " +
      `${POETRY_MAX_AUTHOR_LENGTH} characters.`
    );
  }

  return null;
};

const poetryImageUrl = (filename) =>
  filename
    ? `/wisdom-poetry/images/${encodeURIComponent(
        filename
      )}`
    : null;

const poetryResponse = (row) => ({
  ...row,
  imageUrl:
    poetryImageUrl(
      row.imageFilename
    )
});

const createPoetryImageFilename =
  (file) => {
    const extension =
      POETRY_IMAGE_TYPES[file.type];

    return (
      Date.now() +
      "-" +
      crypto.randomUUID() +
      extension
    );
  };

const validatePoetryImage =
  (file) => {
    if (!file) {
      return null;
    }

    if (
      !POETRY_IMAGE_TYPES[
        file.type
      ]
    ) {
      return (
        "Only JPG, PNG and WEBP images are allowed."
      );
    }

    if (
      file.size >
      POETRY_MAX_IMAGE_SIZE
    ) {
      return (
        "Image must be 10 MB or smaller."
      );
    }

    return null;
  };

const deletePoetryR2Image =
  async (c, filename) => {
    if (!filename) {
      return;
    }

    const key =
      `wisdom-poetry/${filename}`;

    await c.env.MEDIA.delete(key);

    let remaining =
      await c.env.MEDIA.head(key);

    if (remaining) {
      console.warn(
        "Poetry image still existed after first delete; retrying:",
        key
      );

      await c.env.MEDIA.delete(key);

      remaining =
        await c.env.MEDIA.head(key);

      if (remaining) {
        throw new Error(
          "Unable to remove wisdom poetry image from R2."
        );
      }
    }
  };

app.get(
  "/api/wisdom-poetry/",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    try {
      return await withDb(
        c,
        async (client) => {
          const result =
            await client.query(`
              SELECT
                id,
                title,
                author,
                poem,
                "imageFilename",
                "createdAt",
                "updatedAt"
              FROM wisdom_poems
              ORDER BY
                "createdAt" DESC,
                id DESC
            `);

          return c.json({
            success: true,
            poems:
              result.rows.map(
                poetryResponse
              )
          });
        }
      );
    } catch (error) {
      console.error(
        "Wisdom poetry list error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to load wisdom poems."
        },
        500
      );
    }
  }
);

app.post(
  "/api/wisdom-poetry/",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    let uploadedFilename = null;

    try {
      const form =
        await c.req.formData();

      const title =
        normalizePoetryText(
          form.get("title")
        );

      const author =
        normalizePoetryText(
          form.get("author")
        );

      const poem =
        normalizePoetryText(
          form.get("poem")
        );

      const validationError =
        validatePoetry({
          title,
          author,
          poem
        });

      const imageValue =
        form.get("image");

      const image =
        imageValue instanceof File &&
        imageValue.size > 0
          ? imageValue
          : null;

      const imageError =
        validatePoetryImage(image);

      if (imageError) {
        return c.json(
          {
            success: false,
            error: imageError
          },
          400
        );
      }

      if (image) {
        uploadedFilename =
          createPoetryImageFilename(
            image
          );

        await c.env.MEDIA.put(
          `wisdom-poetry/${uploadedFilename}`,
          image.stream(),
          {
            httpMetadata: {
              contentType:
                image.type
            }
          }
        );
      }

      if (validationError) {
        if (uploadedFilename) {
          await deletePoetryR2Image(
            c,
            uploadedFilename
          );
        }

        return c.json(
          {
            success: false,
            error: validationError
          },
          400
        );
      }

      return await withDb(
        c,
        async (client) => {
          try {
            const result =
              await client.query(
                `
                  INSERT INTO wisdom_poems
                  (
                    title,
                    author,
                    poem,
                    "imageFilename",
                    "createdAt",
                    "updatedAt"
                  )
                  VALUES
                  (
                    $1,
                    $2,
                    $3,
                    $4,
                    NOW(),
                    NOW()
                  )
                  RETURNING
                    id,
                    title,
                    author,
                    poem,
                    "imageFilename",
                    "createdAt",
                    "updatedAt"
                `,
                [
                  title || null,
                  author || null,
                  poem,
                  uploadedFilename
                ]
              );

            return c.json(
              {
                success: true,
                message:
                  "Wisdom poem created successfully.",
                poem:
                  poetryResponse(
                    result.rows[0]
                  )
              },
              201
            );
          } catch (error) {
            if (uploadedFilename) {
              await deletePoetryR2Image(
                c,
                uploadedFilename
              ).catch(() => {});
            }

            throw error;
          }
        }
      );
    } catch (error) {
      if (uploadedFilename) {
        await deletePoetryR2Image(
          c,
          uploadedFilename
        ).catch(() => {});
      }

      console.error(
        "Create wisdom poem error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to create wisdom poem."
        },
        500
      );
    }
  }
);

app.patch(
  "/api/wisdom-poetry/:id",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    const id =
      Number(
        c.req.param("id")
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return c.json(
        {
          success: false,
          error:
            "Invalid wisdom poem ID."
        },
        400
      );
    }

    let uploadedFilename = null;

    try {
      const form =
        await c.req.formData();

      const title =
        normalizePoetryText(
          form.get("title")
        );

      const author =
        normalizePoetryText(
          form.get("author")
        );

      const poem =
        normalizePoetryText(
          form.get("poem")
        );

      const removeImage =
        normalizePoetryBoolean(
          form.get("removeImage")
        );

      const validationError =
        validatePoetry({
          title,
          author,
          poem
        });

      if (validationError) {
        return c.json(
          {
            success: false,
            error:
              validationError
          },
          400
        );
      }

      const imageValue =
        form.get("image");

      const image =
        imageValue instanceof File &&
        imageValue.size > 0
          ? imageValue
          : null;

      const imageError =
        validatePoetryImage(image);

      if (imageError) {
        return c.json(
          {
            success: false,
            error: imageError
          },
          400
        );
      }

      return await withDb(
        c,
        async (client) => {
          const existingResult =
            await client.query(
              `
                SELECT
                  id,
                  title,
                  author,
                  poem,
                  "imageFilename",
                  "createdAt",
                  "updatedAt"
                FROM wisdom_poems
                WHERE id = $1
                LIMIT 1
              `,
              [id]
            );

          if (
            existingResult.rowCount ===
            0
          ) {
            return c.json(
              {
                success: false,
                error:
                  "Wisdom poem not found."
              },
              404
            );
          }

          const existing =
            existingResult.rows[0];

          const oldImage =
            existing.imageFilename;

          let nextImage =
            oldImage;

          if (image) {
            uploadedFilename =
              createPoetryImageFilename(
                image
              );

            await c.env.MEDIA.put(
              `wisdom-poetry/${uploadedFilename}`,
              image.stream(),
              {
                httpMetadata: {
                  contentType:
                    image.type
                }
              }
            );

            nextImage =
              uploadedFilename;
          } else if (removeImage) {
            nextImage = null;
          }

          try {
            const result =
              await client.query(
                `
                  UPDATE wisdom_poems
                  SET
                    title = $1,
                    author = $2,
                    poem = $3,
                    "imageFilename" = $4,
                    "updatedAt" = NOW()
                  WHERE id = $5
                  RETURNING
                    id,
                    title,
                    author,
                    poem,
                    "imageFilename",
                    "createdAt",
                    "updatedAt"
                `,
                [
                  title || null,
                  author || null,
                  poem,
                  nextImage,
                  id
                ]
              );

            if (
              oldImage &&
              oldImage !== nextImage
            ) {
              await deletePoetryR2Image(
                c,
                oldImage
              );
            }

            return c.json({
              success: true,
              message:
                "Wisdom poem updated successfully.",
              poem:
                poetryResponse(
                  result.rows[0]
                )
            });
          } catch (error) {
            if (uploadedFilename) {
              await deletePoetryR2Image(
                c,
                uploadedFilename
              ).catch(() => {});
            }

            throw error;
          }
        }
      );
    } catch (error) {
      console.error(
        "Update wisdom poem error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to update wisdom poem."
        },
        500
      );
    }
  }
);

app.delete(
  "/api/wisdom-poetry/:id",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    const id =
      Number(
        c.req.param("id")
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return c.json(
        {
          success: false,
          error:
            "Invalid wisdom poem ID."
        },
        400
      );
    }

    try {
      return await withDb(
        c,
        async (client) => {
          const existingResult =
            await client.query(
              `
                SELECT
                  id,
                  "imageFilename"
                FROM wisdom_poems
                WHERE id = $1
                LIMIT 1
              `,
              [id]
            );

          if (
            existingResult.rowCount ===
            0
          ) {
            return c.json(
              {
                success: false,
                error:
                  "Wisdom poem not found."
              },
              404
            );
          }

          const imageFilename =
            existingResult.rows[0]
              .imageFilename;

          await client.query(
            `
              DELETE FROM wisdom_poems
              WHERE id = $1
            `,
            [id]
          );

          if (imageFilename) {
            await deletePoetryR2Image(
              c,
              imageFilename
            );
          }

          return c.json({
            success: true,
            message:
              "Wisdom poem deleted successfully."
          });
        }
      );
    } catch (error) {
      console.error(
        "Delete wisdom poem error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to delete wisdom poem."
        },
        500
      );
    }
  }
);


app.get("/api/wisdom-poetry/images/:filename", async (c) => {
  const filename = c.req.param("filename");

  if (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return c.json(
      {
        success: false,
        error: "Invalid poetry image filename."
      },
      400
    );
  }

  try {
    const object = await c.env.MEDIA.get(
      `wisdom-poetry/${filename}`
    );

    if (!object) {
      return c.json(
        {
          success: false,
          error: "Poetry image not found."
        },
        404
      );
    }

    const headers = new Headers();

    object.writeHttpMetadata(headers);

    if (!headers.has("Content-Type")) {
      headers.set(
        "Content-Type",
        "application/octet-stream"
      );
    }

    headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    if (object.httpEtag) {
      headers.set("ETag", object.httpEtag);
    }

    return new Response(object.body, {
      headers
    });
  } catch (error) {
    console.error(
      "Wisdom poetry image error:",
      error
    );

    return c.json(
      {
        success: false,
        error: "Unable to load poetry image."
      },
      500
    );
  }
});

app.get("/api/wisdom-poetry/random", async (c) => {
  try {
    return await withDb(c, async (client) => {
      const result = await client.query(`
        SELECT
          id,
          title,
          author,
          poem,
          "imageFilename"
        FROM wisdom_poems
        ORDER BY RANDOM()
        LIMIT 1
      `);

      if (result.rowCount === 0) {
        return c.json(
          {
            success: false,
            error: "No wisdom poems are available yet."
          },
          404
        );
      }

      const poem = result.rows[0];

      return c.json({
        success: true,
        poem: {
          ...poem,
          imageUrl: poem.imageFilename
            ? `/wisdom-poetry/images/${encodeURIComponent(
                poem.imageFilename
              )}`
            : null
        }
      });
    });
  } catch (error) {
    console.error(
      "Random wisdom poem error:",
      error
    );

    return c.json(
      {
        success: false,
        error: "Unable to load a wisdom poem."
      },
      500
    );
  }
});

// =====================================================
// Literary Reflections admin CRUD
// =====================================================

const REFLECTION_MAX_TITLE_LENGTH = 200;
const REFLECTION_MAX_AUTHOR_LENGTH = 200;
const REFLECTION_MAX_REFLECTION_LENGTH = 5000;
const REFLECTION_MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const REFLECTION_IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

const normalizeReflectionText = (value) =>
  String(value || "").trim();

const normalizeReflectionBoolean = (value) =>
  String(value || "")
    .toLowerCase() === "true";

const validateReflection = ({
  title,
  author,
  reflection
}) => {
  if (!reflection) {
    return "Reflection text is required.";
  }

  if (
    reflection.length >
    REFLECTION_MAX_REFLECTION_LENGTH
  ) {
    return (
      "Reflection must not exceed " +
      `${REFLECTION_MAX_REFLECTION_LENGTH} characters.`
    );
  }

  if (
    title.length >
    REFLECTION_MAX_TITLE_LENGTH
  ) {
    return (
      "Title must not exceed " +
      `${REFLECTION_MAX_TITLE_LENGTH} characters.`
    );
  }

  if (
    author.length >
    REFLECTION_MAX_AUTHOR_LENGTH
  ) {
    return (
      "Author must not exceed " +
      `${REFLECTION_MAX_AUTHOR_LENGTH} characters.`
    );
  }

  return null;
};

const reflectionImageUrl = (filename) =>
  filename
    ? `/literary-reflections/images/${encodeURIComponent(
        filename
      )}`
    : null;

const reflectionResponse = (row) => ({
  ...row,
  imageUrl:
    reflectionImageUrl(
      row.imageFilename
    )
});

const createReflectionImageFilename =
  (file) => {
    const extension =
      REFLECTION_IMAGE_TYPES[file.type];

    return (
      Date.now() +
      "-" +
      crypto.randomUUID() +
      extension
    );
  };

const validateReflectionImage =
  (file) => {
    if (!file) {
      return null;
    }

    if (
      !REFLECTION_IMAGE_TYPES[
        file.type
      ]
    ) {
      return (
        "Only JPG, PNG and WEBP images are allowed."
      );
    }

    if (
      file.size >
      REFLECTION_MAX_IMAGE_SIZE
    ) {
      return (
        "Image must be 10 MB or smaller."
      );
    }

    return null;
  };

const deleteReflectionR2Image =
  async (c, filename) => {
    if (!filename) {
      return;
    }

    const key =
      `literary-reflections/${filename}`;

    await c.env.MEDIA.delete(key);

    let remaining =
      await c.env.MEDIA.head(key);

    if (remaining) {
      console.warn(
        "Reflection image still existed after first delete; retrying:",
        key
      );

      await c.env.MEDIA.delete(key);

      remaining =
        await c.env.MEDIA.head(key);

      if (remaining) {
        throw new Error(
          "Unable to remove literary reflections image from R2."
        );
      }
    }
  };

app.get(
  "/api/literary-reflections/",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    try {
      return await withDb(
        c,
        async (client) => {
          const result =
            await client.query(`
              SELECT
                id,
                title,
                author,
                reflection,
                "imageFilename",
                "createdAt",
                "updatedAt"
              FROM literary_reflections
              ORDER BY
                "createdAt" DESC,
                id DESC
            `);

          return c.json({
            success: true,
            reflections:
              result.rows.map(
                reflectionResponse
              )
          });
        }
      );
    } catch (error) {
      console.error(
        "Literary reflection list error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to load literary reflections."
        },
        500
      );
    }
  }
);

app.post(
  "/api/literary-reflections/",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    let uploadedFilename = null;

    try {
      const form =
        await c.req.formData();

      const title =
        normalizeReflectionText(
          form.get("title")
        );

      const author =
        normalizeReflectionText(
          form.get("author")
        );

      const reflection =
        normalizeReflectionText(
          form.get("reflection")
        );

      const validationError =
        validateReflection({
          title,
          author,
          reflection
        });

      const imageValue =
        form.get("image");

      const image =
        imageValue instanceof File &&
        imageValue.size > 0
          ? imageValue
          : null;

      const imageError =
        validateReflectionImage(image);

      if (imageError) {
        return c.json(
          {
            success: false,
            error: imageError
          },
          400
        );
      }

      if (image) {
        uploadedFilename =
          createReflectionImageFilename(
            image
          );

        await c.env.MEDIA.put(
          `literary-reflections/${uploadedFilename}`,
          image.stream(),
          {
            httpMetadata: {
              contentType:
                image.type
            }
          }
        );
      }

      if (validationError) {
        if (uploadedFilename) {
          await deleteReflectionR2Image(
            c,
            uploadedFilename
          );
        }

        return c.json(
          {
            success: false,
            error: validationError
          },
          400
        );
      }

      return await withDb(
        c,
        async (client) => {
          try {
            const result =
              await client.query(
                `
                  INSERT INTO literary_reflections
                  (
                    title,
                    author,
                    reflection,
                    "imageFilename",
                    "createdAt",
                    "updatedAt"
                  )
                  VALUES
                  (
                    $1,
                    $2,
                    $3,
                    $4,
                    NOW(),
                    NOW()
                  )
                  RETURNING
                    id,
                    title,
                    author,
                    reflection,
                    "imageFilename",
                    "createdAt",
                    "updatedAt"
                `,
                [
                  title || null,
                  author || null,
                  reflection,
                  uploadedFilename
                ]
              );

            return c.json(
              {
                success: true,
                message:
                  "Literary reflection created successfully.",
                reflection:
                  reflectionResponse(
                    result.rows[0]
                  )
              },
              201
            );
          } catch (error) {
            if (uploadedFilename) {
              await deleteReflectionR2Image(
                c,
                uploadedFilename
              ).catch(() => {});
            }

            throw error;
          }
        }
      );
    } catch (error) {
      if (uploadedFilename) {
        await deleteReflectionR2Image(
          c,
          uploadedFilename
        ).catch(() => {});
      }

      console.error(
        "Create literary reflection error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to create literary reflection."
        },
        500
      );
    }
  }
);

app.patch(
  "/api/literary-reflections/:id",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    const id =
      Number(
        c.req.param("id")
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return c.json(
        {
          success: false,
          error:
            "Invalid literary reflection ID."
        },
        400
      );
    }

    let uploadedFilename = null;

    try {
      const form =
        await c.req.formData();

      const title =
        normalizeReflectionText(
          form.get("title")
        );

      const author =
        normalizeReflectionText(
          form.get("author")
        );

      const reflection =
        normalizeReflectionText(
          form.get("reflection")
        );

      const removeImage =
        normalizeReflectionBoolean(
          form.get("removeImage")
        );

      const validationError =
        validateReflection({
          title,
          author,
          reflection
        });

      if (validationError) {
        return c.json(
          {
            success: false,
            error:
              validationError
          },
          400
        );
      }

      const imageValue =
        form.get("image");

      const image =
        imageValue instanceof File &&
        imageValue.size > 0
          ? imageValue
          : null;

      const imageError =
        validateReflectionImage(image);

      if (imageError) {
        return c.json(
          {
            success: false,
            error: imageError
          },
          400
        );
      }

      return await withDb(
        c,
        async (client) => {
          const existingResult =
            await client.query(
              `
                SELECT
                  id,
                  title,
                  author,
                  reflection,
                  "imageFilename",
                  "createdAt",
                  "updatedAt"
                FROM literary_reflections
                WHERE id = $1
                LIMIT 1
              `,
              [id]
            );

          if (
            existingResult.rowCount ===
            0
          ) {
            return c.json(
              {
                success: false,
                error:
                  "Literary reflection not found."
              },
              404
            );
          }

          const existing =
            existingResult.rows[0];

          const oldImage =
            existing.imageFilename;

          let nextImage =
            oldImage;

          if (image) {
            uploadedFilename =
              createReflectionImageFilename(
                image
              );

            await c.env.MEDIA.put(
              `literary-reflections/${uploadedFilename}`,
              image.stream(),
              {
                httpMetadata: {
                  contentType:
                    image.type
                }
              }
            );

            nextImage =
              uploadedFilename;
          } else if (removeImage) {
            nextImage = null;
          }

          try {
            const result =
              await client.query(
                `
                  UPDATE literary_reflections
                  SET
                    title = $1,
                    author = $2,
                    reflection = $3,
                    "imageFilename" = $4,
                    "updatedAt" = NOW()
                  WHERE id = $5
                  RETURNING
                    id,
                    title,
                    author,
                    reflection,
                    "imageFilename",
                    "createdAt",
                    "updatedAt"
                `,
                [
                  title || null,
                  author || null,
                  reflection,
                  nextImage,
                  id
                ]
              );

            if (
              oldImage &&
              oldImage !== nextImage
            ) {
              await deleteReflectionR2Image(
                c,
                oldImage
              );
            }

            return c.json({
              success: true,
              message:
                "Literary reflection updated successfully.",
              reflection:
                reflectionResponse(
                  result.rows[0]
                )
            });
          } catch (error) {
            if (uploadedFilename) {
              await deleteReflectionR2Image(
                c,
                uploadedFilename
              ).catch(() => {});
            }

            throw error;
          }
        }
      );
    } catch (error) {
      console.error(
        "Update literary reflection error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to update literary reflection."
        },
        500
      );
    }
  }
);

app.delete(
  "/api/literary-reflections/:id",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    const id =
      Number(
        c.req.param("id")
      );

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return c.json(
        {
          success: false,
          error:
            "Invalid literary reflection ID."
        },
        400
      );
    }

    try {
      return await withDb(
        c,
        async (client) => {
          const existingResult =
            await client.query(
              `
                SELECT
                  id,
                  "imageFilename"
                FROM literary_reflections
                WHERE id = $1
                LIMIT 1
              `,
              [id]
            );

          if (
            existingResult.rowCount ===
            0
          ) {
            return c.json(
              {
                success: false,
                error:
                  "Literary reflection not found."
              },
              404
            );
          }

          const imageFilename =
            existingResult.rows[0]
              .imageFilename;

          await client.query(
            `
              DELETE FROM literary_reflections
              WHERE id = $1
            `,
            [id]
          );

          if (imageFilename) {
            await deleteReflectionR2Image(
              c,
              imageFilename
            );
          }

          return c.json({
            success: true,
            message:
              "Literary reflection deleted successfully."
          });
        }
      );
    } catch (error) {
      console.error(
        "Delete literary reflection error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to delete literary reflection."
        },
        500
      );
    }
  }
);


app.get("/api/literary-reflections/images/:filename", async (c) => {
  const filename = c.req.param("filename");

  if (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return c.json(
      {
        success: false,
        error: "Invalid reflection image filename."
      },
      400
    );
  }

  try {
    const object = await c.env.MEDIA.get(
      `literary-reflections/${filename}`
    );

    if (!object) {
      return c.json(
        {
          success: false,
          error: "Reflection image not found."
        },
        404
      );
    }

    const headers = new Headers();

    object.writeHttpMetadata(headers);

    if (!headers.has("Content-Type")) {
      headers.set(
        "Content-Type",
        "application/octet-stream"
      );
    }

    headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    if (object.httpEtag) {
      headers.set("ETag", object.httpEtag);
    }

    return new Response(object.body, {
      headers
    });
  } catch (error) {
    console.error(
      "Literary reflection image error:",
      error
    );

    return c.json(
      {
        success: false,
        error: "Unable to load reflection image."
      },
      500
    );
  }
});

app.get("/api/literary-reflections/random", async (c) => {
  try {
    return await withDb(c, async (client) => {


      const result = await client.query(`
        SELECT
          id,
          title,
          author,
          reflection,
          "imageFilename"
        FROM literary_reflections
        ORDER BY RANDOM()
        LIMIT 1
      `);

      if (result.rowCount === 0) {
        return c.json(
          {
            success: false,
            error: "No literary reflections are available yet."
          },
          404
        );
      }

      const reflection = result.rows[0];

      return c.json({
        success: true,
        reflection: {
          ...reflection,
          imageUrl: reflection.imageFilename
            ? `/literary-reflections/images/${encodeURIComponent(
                reflection.imageFilename
              )}`
            : null
        }
      });
    });
  } catch (error) {
    console.error(
      "Random literary reflection error:",
      error
    );

    return c.json(
      {
        success: false,
        error: "Unable to load a literary reflection."
      },
      500
    );
  }
});

app.get("/api/gallery", async (c) => {
  try {
    return await withDb(c, async (client) => {
      const result = await client.query(`
        SELECT
          id,
          "titleEn",
          "titleDe",
          "titleAr",
          "descriptionEn",
          "descriptionDe",
          "descriptionAr",
          "imageFilename",
          "imageMimeType",
          "imageSize",
          "createdAt",
          "updatedAt"
        FROM gallery_images
        ORDER BY "createdAt" DESC, id DESC
      `);

      const images = result.rows.map((image) => ({
        ...image,
        imageSize:
          image.imageSize == null
            ? null
            : Number(image.imageSize),
        imageUrl: image.imageFilename
          ? `/gallery/image/${encodeURIComponent(
              image.imageFilename
            )}`
          : null
      }));

      return c.json({
        success: true,
        images
      });
    });
  } catch (error) {
    console.error("Load gallery error:", error);

    return c.json(
      {
        success: false,
        error: "Unable to load gallery."
      },
      500
    );
  }
});


// =====================================================
// Gallery admin CRUD
// =====================================================

const GALLERY_MAX_TITLE_LENGTH = 200;
const GALLERY_MAX_DESCRIPTION_LENGTH =
  5000;
const GALLERY_MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const GALLERY_IMAGE_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

const normalizeGalleryText = (value) =>
  String(value ?? "").trim();

const getGalleryFields = (
  form,
  existing = null
) => {
  const read = (field) => {
    const value =
      form.get(field);

    if (
      value === null &&
      existing
    ) {
      return normalizeGalleryText(
        existing[field]
      );
    }

    return normalizeGalleryText(
      value
    );
  };

  return {
    titleEn: read("titleEn"),
    titleDe: read("titleDe"),
    titleAr: read("titleAr"),
    descriptionEn:
      read("descriptionEn"),
    descriptionDe:
      read("descriptionDe"),
    descriptionAr:
      read("descriptionAr")
  };
};

const validateGalleryFields = (
  fields
) => {
  if (!fields.titleEn) {
    return (
      "English image title is required."
    );
  }

  if (
    fields.titleEn.length >
      GALLERY_MAX_TITLE_LENGTH ||
    fields.titleDe.length >
      GALLERY_MAX_TITLE_LENGTH ||
    fields.titleAr.length >
      GALLERY_MAX_TITLE_LENGTH
  ) {
    return (
      "Image titles must not exceed " +
      `${GALLERY_MAX_TITLE_LENGTH} characters.`
    );
  }

  if (
    fields.descriptionEn.length >
      GALLERY_MAX_DESCRIPTION_LENGTH ||
    fields.descriptionDe.length >
      GALLERY_MAX_DESCRIPTION_LENGTH ||
    fields.descriptionAr.length >
      GALLERY_MAX_DESCRIPTION_LENGTH
  ) {
    return (
      "Image descriptions must not exceed " +
      `${GALLERY_MAX_DESCRIPTION_LENGTH} characters.`
    );
  }

  return null;
};

const validateGalleryImage = (
  file
) => {
  if (!file) {
    return null;
  }

  if (
    !GALLERY_IMAGE_TYPES[
      file.type
    ]
  ) {
    return (
      "Only JPG, PNG, WEBP and GIF images are allowed."
    );
  }

  if (
    file.size >
    GALLERY_MAX_IMAGE_SIZE
  ) {
    return (
      "Image must not exceed 10 MB."
    );
  }

  return null;
};

const createGalleryFilename = (
  file
) => {
  return (
    Date.now() +
    "-" +
    crypto.randomUUID() +
    GALLERY_IMAGE_TYPES[file.type]
  );
};

const serializeGalleryAdminImage =
  (image) => ({
    ...image,

    imageSize:
      image.imageSize == null
        ? null
        : Number(
            image.imageSize
          ),

    imageUrl:
      image.imageFilename
        ? `/gallery/image/${encodeURIComponent(
            image.imageFilename
          )}`
        : null
  });

const deleteGalleryR2Image =
  async (c, filename) => {
    if (!filename) {
      return;
    }

    const key =
      `gallery/${filename}`;

    await c.env.MEDIA.delete(key);

    let remaining =
      await c.env.MEDIA.head(key);

    if (remaining) {
      console.warn(
        "Gallery image still existed after first delete; retrying:",
        key
      );

      await c.env.MEDIA.delete(key);

      remaining =
        await c.env.MEDIA.head(key);

      if (remaining) {
        throw new Error(
          "Unable to remove gallery image from R2."
        );
      }
    }
  };

app.post(
  "/api/gallery",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    let uploadedFilename = null;

    try {
      const form =
        await c.req.formData();

      const fields =
        getGalleryFields(form);

      const textError =
        validateGalleryFields(
          fields
        );

      if (textError) {
        return c.json(
          {
            success: false,
            error: textError
          },
          400
        );
      }

      const imageValue =
        form.get("image");

      const imageFile =
        imageValue instanceof File &&
        imageValue.size > 0
          ? imageValue
          : null;

      if (!imageFile) {
        return c.json(
          {
            success: false,
            error:
              "An image file is required."
          },
          400
        );
      }

      const imageError =
        validateGalleryImage(
          imageFile
        );

      if (imageError) {
        return c.json(
          {
            success: false,
            error: imageError
          },
          400
        );
      }

      uploadedFilename =
        createGalleryFilename(
          imageFile
        );

      await c.env.MEDIA.put(
        `gallery/${uploadedFilename}`,
        imageFile.stream(),
        {
          httpMetadata: {
            contentType:
              imageFile.type
          }
        }
      );

      try {
        return await withDb(
          c,
          async (client) => {
            const result =
              await client.query(
                `
                  INSERT INTO gallery_images
                  (
                    "titleEn",
                    "titleDe",
                    "titleAr",
                    "descriptionEn",
                    "descriptionDe",
                    "descriptionAr",
                    "imageFilename",
                    "imageMimeType",
                    "imageSize",
                    "createdAt",
                    "updatedAt"
                  )
                  VALUES
                  (
                    $1,$2,$3,$4,$5,
                    $6,$7,$8,$9,
                    NOW(),NOW()
                  )
                  RETURNING
                    id,
                    "titleEn",
                    "titleDe",
                    "titleAr",
                    "descriptionEn",
                    "descriptionDe",
                    "descriptionAr",
                    "imageFilename",
                    "imageMimeType",
                    "imageSize",
                    "createdAt",
                    "updatedAt"
                `,
                [
                  fields.titleEn,
                  fields.titleDe || null,
                  fields.titleAr || null,
                  fields.descriptionEn || null,
                  fields.descriptionDe || null,
                  fields.descriptionAr || null,
                  uploadedFilename,
                  imageFile.type,
                  imageFile.size
                ]
              );

            uploadedFilename = null;

            return c.json(
              {
                success: true,
                image:
                  serializeGalleryAdminImage(
                    result.rows[0]
                  )
              },
              201
            );
          }
        );
      } catch (error) {
        if (uploadedFilename) {
          await deleteGalleryR2Image(
            c,
            uploadedFilename
          ).catch(() => {});
        }

        throw error;
      }
    } catch (error) {
      if (uploadedFilename) {
        await deleteGalleryR2Image(
          c,
          uploadedFilename
        ).catch(() => {});
      }

      console.error(
        "Create gallery image error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to create gallery image."
        },
        500
      );
    }
  }
);

app.patch(
  "/api/gallery/:id",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    const id =
      Number(
        c.req.param("id")
      );

    let uploadedFilename = null;

    try {
      const form =
        await c.req.formData();

      return await withDb(
        c,
        async (client) => {
          const existingResult =
            await client.query(
              `
                SELECT
                  id,
                  "titleEn",
                  "titleDe",
                  "titleAr",
                  "descriptionEn",
                  "descriptionDe",
                  "descriptionAr",
                  "imageFilename",
                  "imageMimeType",
                  "imageSize",
                  "createdAt",
                  "updatedAt"
                FROM gallery_images
                WHERE id = $1
                LIMIT 1
              `,
              [id]
            );

          if (
            existingResult.rowCount ===
            0
          ) {
            return c.json(
              {
                success: false,
                error:
                  "Gallery image not found."
              },
              404
            );
          }

          const existing =
            existingResult.rows[0];

          const fields =
            getGalleryFields(
              form,
              existing
            );

          const textError =
            validateGalleryFields(
              fields
            );

          if (textError) {
            return c.json(
              {
                success: false,
                error: textError
              },
              400
            );
          }

          const imageValue =
            form.get("image");

          const imageFile =
            imageValue instanceof File &&
            imageValue.size > 0
              ? imageValue
              : null;

          const imageError =
            validateGalleryImage(
              imageFile
            );

          if (imageError) {
            return c.json(
              {
                success: false,
                error:
                  imageError
              },
              400
            );
          }

          const oldFilename =
            existing.imageFilename;

          let nextFilename =
            oldFilename;

          let nextMimeType =
            existing.imageMimeType;

          let nextSize =
            existing.imageSize;

          if (imageFile) {
            uploadedFilename =
              createGalleryFilename(
                imageFile
              );

            await c.env.MEDIA.put(
              `gallery/${uploadedFilename}`,
              imageFile.stream(),
              {
                httpMetadata: {
                  contentType:
                    imageFile.type
                }
              }
            );

            nextFilename =
              uploadedFilename;

            nextMimeType =
              imageFile.type;

            nextSize =
              imageFile.size;
          }

          try {
            const result =
              await client.query(
                `
                  UPDATE gallery_images
                  SET
                    "titleEn" = $1,
                    "titleDe" = $2,
                    "titleAr" = $3,
                    "descriptionEn" = $4,
                    "descriptionDe" = $5,
                    "descriptionAr" = $6,
                    "imageFilename" = $7,
                    "imageMimeType" = $8,
                    "imageSize" = $9,
                    "updatedAt" = NOW()
                  WHERE id = $10
                  RETURNING
                    id,
                    "titleEn",
                    "titleDe",
                    "titleAr",
                    "descriptionEn",
                    "descriptionDe",
                    "descriptionAr",
                    "imageFilename",
                    "imageMimeType",
                    "imageSize",
                    "createdAt",
                    "updatedAt"
                `,
                [
                  fields.titleEn,
                  fields.titleDe || null,
                  fields.titleAr || null,
                  fields.descriptionEn || null,
                  fields.descriptionDe || null,
                  fields.descriptionAr || null,
                  nextFilename,
                  nextMimeType,
                  nextSize,
                  id
                ]
              );

            if (
              imageFile &&
              oldFilename &&
              oldFilename !==
                nextFilename
            ) {
              await deleteGalleryR2Image(
                c,
                oldFilename
              );
            }

            uploadedFilename = null;

            return c.json({
              success: true,
              image:
                serializeGalleryAdminImage(
                  result.rows[0]
                )
            });
          } catch (error) {
            if (uploadedFilename) {
              await deleteGalleryR2Image(
                c,
                uploadedFilename
              ).catch(() => {});
            }

            throw error;
          }
        }
      );
    } catch (error) {
      console.error(
        "Update gallery image error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to update gallery image."
        },
        500
      );
    }
  }
);

app.delete(
  "/api/gallery/:id",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    const id =
      Number(
        c.req.param("id")
      );

    try {
      return await withDb(
        c,
        async (client) => {
          const result =
            await client.query(
              `
                SELECT
                  id,
                  "imageFilename"
                FROM gallery_images
                WHERE id = $1
                LIMIT 1
              `,
              [id]
            );

          if (
            result.rowCount === 0
          ) {
            return c.json(
              {
                success: false,
                error:
                  "Gallery image not found."
              },
              404
            );
          }

          const filename =
            result.rows[0]
              .imageFilename;

          await client.query(
            `
              DELETE FROM gallery_images
              WHERE id = $1
            `,
            [id]
          );

          await deleteGalleryR2Image(
            c,
            filename
          );

          return c.json({
            success: true,
            message:
              "Gallery image deleted."
          });
        }
      );
    } catch (error) {
      console.error(
        "Delete gallery image error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to delete gallery image."
        },
        500
      );
    }
  }
);


app.get("/api/gallery/image/:filename", async (c) => {
  const filename = c.req.param("filename");

  if (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return c.json(
      {
        success: false,
        error: "Invalid image filename."
      },
      400
    );
  }

  try {
    return await withDb(c, async (client) => {
      const result = await client.query(
        `
          SELECT
            "imageFilename",
            "imageMimeType"
          FROM gallery_images
          WHERE "imageFilename" = $1
          LIMIT 1
        `,
        [filename]
      );

      if (result.rowCount === 0) {
        return c.json(
          {
            success: false,
            error: "Image not found."
          },
          404
        );
      }

      const object = await c.env.MEDIA.get(
        `gallery/${filename}`
      );

      if (!object) {
        return c.json(
          {
            success: false,
            error: "Image file not found."
          },
          404
        );
      }

      const image = result.rows[0];
      const headers = new Headers();

      object.writeHttpMetadata(headers);

      headers.set(
        "Content-Type",
        image.imageMimeType || "application/octet-stream"
      );

      headers.set(
        "Cache-Control",
        "public, max-age=86400"
      );

      if (object.httpEtag) {
        headers.set("ETag", object.httpEtag);
      }

      return new Response(object.body, {
        headers
      });
    });
  } catch (error) {
    console.error(
      "Serve gallery image error:",
      error
    );

    return c.json(
      {
        success: false,
        error: "Unable to load image."
      },
      500
    );
  }
});

app.get("/api/videos", async (c) => {
  try {
    return await withDb(c, async (client) => {
      const result = await client.query(`
        SELECT
          id,
          title,
          description,
          "titleEn",
          "titleDe",
          "titleAr",
          "descriptionEn",
          "descriptionDe",
          "descriptionAr",
          "videoFilename",
          "videoMimeType",
          "videoSize",
          "createdAt",
          "updatedAt"
        FROM videos
        ORDER BY "createdAt" DESC
      `);

      const videos = result.rows.map((video) => ({
        ...video,

        videoSize:
          video.videoSize == null
            ? null
            : Number(video.videoSize),

        videoUrl: video.videoFilename
          ? `/videos/stream/${encodeURIComponent(
              video.videoFilename
            )}`
          : null
      }));

      return c.json({
        success: true,
        videos
      });
    });
  } catch (error) {
    console.error(
      "List videos error:",
      error
    );

    return c.json(
      {
        success: false,
        error: "Could not load videos."
      },
      500
    );
  }
});


// =====================================================
// Videos admin CRUD
// =====================================================

const VIDEO_MAX_TITLE_LENGTH = 200;

const VIDEO_MAX_DESCRIPTION_LENGTH =
  5000;

const VIDEO_MAX_SIZE =
  200 * 1024 * 1024;

const VIDEO_ALLOWED_TYPES = {
  "video/mp4": ".mp4",
  "video/webm": ".webm"
};

const normalizeVideoTitle = (value) =>
  String(value || "").trim();

const normalizeVideoDescription =
  (value) =>
    String(value || "").trim();

const validateVideoTextWorker = (
  title,
  description
) => {
  if (!title) {
    return "Video title is required.";
  }

  if (
    title.length >
    VIDEO_MAX_TITLE_LENGTH
  ) {
    return (
      "Video title must not exceed " +
      `${VIDEO_MAX_TITLE_LENGTH} characters.`
    );
  }

  if (
    description.length >
    VIDEO_MAX_DESCRIPTION_LENGTH
  ) {
    return (
      "Video description must not exceed " +
      `${VIDEO_MAX_DESCRIPTION_LENGTH} characters.`
    );
  }

  return null;
};

const validateTranslatedVideoTextWorker =
  (
    titleDe,
    titleAr,
    descriptionDe,
    descriptionAr
  ) => {
    if (
      titleDe.length >
        VIDEO_MAX_TITLE_LENGTH ||
      titleAr.length >
        VIDEO_MAX_TITLE_LENGTH
    ) {
      return (
        "Translated video titles must not exceed " +
        `${VIDEO_MAX_TITLE_LENGTH} characters.`
      );
    }

    if (
      descriptionDe.length >
        VIDEO_MAX_DESCRIPTION_LENGTH ||
      descriptionAr.length >
        VIDEO_MAX_DESCRIPTION_LENGTH
    ) {
      return (
        "Translated video descriptions must not exceed " +
        `${VIDEO_MAX_DESCRIPTION_LENGTH} characters.`
      );
    }

    return null;
  };

const validateVideoFileWorker = (
  file
) => {
  if (!file) {
    return null;
  }

  if (
    !VIDEO_ALLOWED_TYPES[
      file.type
    ]
  ) {
    return (
      "Only MP4 and WEBM videos are allowed."
    );
  }

  if (
    file.size >
    VIDEO_MAX_SIZE
  ) {
    return (
      "Video must not exceed 200 MB."
    );
  }

  return null;
};

const createVideoFilenameWorker =
  (file) => {
    return (
      Date.now() +
      "-" +
      crypto.randomUUID() +
      VIDEO_ALLOWED_TYPES[file.type]
    );
  };

const serializeVideoWorker = (
  video
) => ({
  ...video,

  videoSize:
    video.videoSize == null
      ? null
      : Number(video.videoSize),

  videoUrl:
    video.videoFilename
      ? `/videos/stream/${encodeURIComponent(
          video.videoFilename
        )}`
      : null
});

const deleteVideoR2File =
  async (c, filename) => {
    if (!filename) {
      return;
    }

    const key =
      `videos/${filename}`;

    await c.env.MEDIA.delete(key);

    let remaining =
      await c.env.MEDIA.head(key);

    if (remaining) {
      console.warn(
        "Video still existed after first R2 delete; retrying:",
        key
      );

      await c.env.MEDIA.delete(key);

      remaining =
        await c.env.MEDIA.head(key);

      if (remaining) {
        throw new Error(
          "Unable to remove video from R2."
        );
      }
    }
  };

const getVideoFormFile = (
  form
) => {
  const value =
    form.get("video");

  return (
    value instanceof File &&
    value.size > 0
  )
    ? value
    : null;
};

app.post(
  "/api/videos",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    let uploadedFilename = null;

    try {
      const form =
        await c.req.formData();

      const titleEn =
        normalizeVideoTitle(
          form.get("titleEn") ??
          form.get("title")
        );

      const titleDe =
        normalizeVideoTitle(
          form.get("titleDe")
        );

      const titleAr =
        normalizeVideoTitle(
          form.get("titleAr")
        );

      const descriptionEn =
        normalizeVideoDescription(
          form.get("descriptionEn") ??
          form.get("description")
        );

      const descriptionDe =
        normalizeVideoDescription(
          form.get("descriptionDe")
        );

      const descriptionAr =
        normalizeVideoDescription(
          form.get("descriptionAr")
        );

      const validationError =
        validateVideoTextWorker(
          titleEn,
          descriptionEn
        ) ||
        validateTranslatedVideoTextWorker(
          titleDe,
          titleAr,
          descriptionDe,
          descriptionAr
        );

      if (validationError) {
        return c.json(
          {
            success: false,
            error:
              validationError
          },
          400
        );
      }

      const videoFile =
        getVideoFormFile(form);

      if (!videoFile) {
        return c.json(
          {
            success: false,
            error:
              "Please choose an MP4 or WEBM video."
          },
          400
        );
      }

      const fileError =
        validateVideoFileWorker(
          videoFile
        );

      if (fileError) {
        return c.json(
          {
            success: false,
            error: fileError
          },
          400
        );
      }

      uploadedFilename =
        createVideoFilenameWorker(
          videoFile
        );

      await c.env.MEDIA.put(
        `videos/${uploadedFilename}`,
        videoFile.stream(),
        {
          httpMetadata: {
            contentType:
              videoFile.type
          }
        }
      );

      try {
        const response =
          await withDb(
            c,
            async (client) => {
              const result =
                await client.query(
                  `
                    INSERT INTO videos
                    (
                      title,
                      description,
                      "titleEn",
                      "titleDe",
                      "titleAr",
                      "descriptionEn",
                      "descriptionDe",
                      "descriptionAr",
                      "videoFilename",
                      "videoMimeType",
                      "videoSize",
                      "createdAt",
                      "updatedAt"
                    )
                    VALUES
                    (
                      $1,$2,$3,$4,$5,
                      $6,$7,$8,$9,$10,
                      $11,NOW(),NOW()
                    )
                    RETURNING
                      id,
                      title,
                      description,
                      "titleEn",
                      "titleDe",
                      "titleAr",
                      "descriptionEn",
                      "descriptionDe",
                      "descriptionAr",
                      "videoFilename",
                      "videoMimeType",
                      "videoSize",
                      "createdAt",
                      "updatedAt"
                  `,
                  [
                    titleEn,
                    descriptionEn || null,
                    titleEn || null,
                    titleDe || null,
                    titleAr || null,
                    descriptionEn || null,
                    descriptionDe || null,
                    descriptionAr || null,
                    uploadedFilename,
                    videoFile.type,
                    videoFile.size
                  ]
                );

              return c.json(
                {
                  success: true,
                  video:
                    serializeVideoWorker(
                      result.rows[0]
                    )
                },
                201
              );
            }
          );

        uploadedFilename = null;

        return response;
      } catch (error) {
        if (uploadedFilename) {
          await deleteVideoR2File(
            c,
            uploadedFilename
          ).catch(() => {});
        }

        throw error;
      }
    } catch (error) {
      if (uploadedFilename) {
        await deleteVideoR2File(
          c,
          uploadedFilename
        ).catch(() => {});
      }

      console.error(
        "Create video error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Could not create video."
        },
        500
      );
    }
  }
);

app.patch(
  "/api/videos/:id",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    const id =
      Number(
        c.req.param("id")
      );

    let uploadedFilename = null;

    try {
      const form =
        await c.req.formData();

      return await withDb(
        c,
        async (client) => {
          const existingResult =
            await client.query(
              `
                SELECT
                  id,
                  title,
                  description,
                  "titleEn",
                  "titleDe",
                  "titleAr",
                  "descriptionEn",
                  "descriptionDe",
                  "descriptionAr",
                  "videoFilename",
                  "videoMimeType",
                  "videoSize",
                  "createdAt",
                  "updatedAt"
                FROM videos
                WHERE id = $1
                LIMIT 1
              `,
              [id]
            );

          if (
            existingResult.rowCount ===
            0
          ) {
            return c.json(
              {
                success: false,
                error:
                  "Video not found."
              },
              404
            );
          }

          const existing =
            existingResult.rows[0];

          const readField = (
            name,
            fallback
          ) => {
            if (!form.has(name)) {
              return fallback || "";
            }

            return form.get(name);
          };

          const titleEn =
            normalizeVideoTitle(
              readField(
                "titleEn",
                existing.titleEn ||
                  existing.title
              )
            );

          const titleDe =
            normalizeVideoTitle(
              readField(
                "titleDe",
                existing.titleDe
              )
            );

          const titleAr =
            normalizeVideoTitle(
              readField(
                "titleAr",
                existing.titleAr
              )
            );

          const descriptionEn =
            normalizeVideoDescription(
              readField(
                "descriptionEn",
                existing.descriptionEn ||
                  existing.description
              )
            );

          const descriptionDe =
            normalizeVideoDescription(
              readField(
                "descriptionDe",
                existing.descriptionDe
              )
            );

          const descriptionAr =
            normalizeVideoDescription(
              readField(
                "descriptionAr",
                existing.descriptionAr
              )
            );

          const validationError =
            validateVideoTextWorker(
              titleEn,
              descriptionEn
            ) ||
            validateTranslatedVideoTextWorker(
              titleDe,
              titleAr,
              descriptionDe,
              descriptionAr
            );

          if (validationError) {
            return c.json(
              {
                success: false,
                error:
                  validationError
              },
              400
            );
          }

          const videoFile =
            getVideoFormFile(form);

          const fileError =
            validateVideoFileWorker(
              videoFile
            );

          if (fileError) {
            return c.json(
              {
                success: false,
                error: fileError
              },
              400
            );
          }

          const oldFilename =
            existing.videoFilename;

          let nextFilename =
            oldFilename;

          let nextMimeType =
            existing.videoMimeType;

          let nextSize =
            existing.videoSize;

          if (videoFile) {
            uploadedFilename =
              createVideoFilenameWorker(
                videoFile
              );

            await c.env.MEDIA.put(
              `videos/${uploadedFilename}`,
              videoFile.stream(),
              {
                httpMetadata: {
                  contentType:
                    videoFile.type
                }
              }
            );

            nextFilename =
              uploadedFilename;

            nextMimeType =
              videoFile.type;

            nextSize =
              videoFile.size;
          }

          let updated;

          try {
            const result =
              await client.query(
                `
                  UPDATE videos
                  SET
                    title = $1,
                    description = $2,
                    "titleEn" = $3,
                    "titleDe" = $4,
                    "titleAr" = $5,
                    "descriptionEn" = $6,
                    "descriptionDe" = $7,
                    "descriptionAr" = $8,
                    "videoFilename" = $9,
                    "videoMimeType" = $10,
                    "videoSize" = $11,
                    "updatedAt" = NOW()
                  WHERE id = $12
                  RETURNING
                    id,
                    title,
                    description,
                    "titleEn",
                    "titleDe",
                    "titleAr",
                    "descriptionEn",
                    "descriptionDe",
                    "descriptionAr",
                    "videoFilename",
                    "videoMimeType",
                    "videoSize",
                    "createdAt",
                    "updatedAt"
                `,
                [
                  titleEn,
                  descriptionEn || null,
                  titleEn || null,
                  titleDe || null,
                  titleAr || null,
                  descriptionEn || null,
                  descriptionDe || null,
                  descriptionAr || null,
                  nextFilename,
                  nextMimeType,
                  nextSize,
                  id
                ]
              );

            updated =
              result.rows[0];

            uploadedFilename = null;
          } catch (error) {
            if (uploadedFilename) {
              await deleteVideoR2File(
                c,
                uploadedFilename
              ).catch(() => {});
            }

            throw error;
          }

          if (
            videoFile &&
            oldFilename &&
            oldFilename !==
              nextFilename
          ) {
            await deleteVideoR2File(
              c,
              oldFilename
            ).catch((error) => {
              console.error(
                "Delete replaced video error:",
                error
              );
            });
          }

          return c.json({
            success: true,

            replacedVideo:
              Boolean(videoFile),

            video:
              serializeVideoWorker(
                updated
              )
          });
        }
      );
    } catch (error) {
      if (uploadedFilename) {
        await deleteVideoR2File(
          c,
          uploadedFilename
        ).catch(() => {});
      }

      console.error(
        "Update video error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Could not update video."
        },
        500
      );
    }
  }
);

app.delete(
  "/api/videos/:id",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    const id =
      Number(
        c.req.param("id")
      );

    try {
      return await withDb(
        c,
        async (client) => {
          const existingResult =
            await client.query(
              `
                SELECT
                  id,
                  "videoFilename"
                FROM videos
                WHERE id = $1
                LIMIT 1
              `,
              [id]
            );

          if (
            existingResult.rowCount ===
            0
          ) {
            return c.json(
              {
                success: false,
                error:
                  "Video not found."
              },
              404
            );
          }

          const filename =
            existingResult.rows[0]
              .videoFilename;

          await client.query(
            `
              DELETE FROM videos
              WHERE id = $1
            `,
            [id]
          );

          await deleteVideoR2File(
            c,
            filename
          ).catch((error) => {
            console.error(
              "Delete video file error:",
              error
            );
          });

          return c.json({
            success: true
          });
        }
      );
    } catch (error) {
      console.error(
        "Delete video error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Could not delete video."
        },
        500
      );
    }
  }
);


app.get(
  "/api/videos/stream/:filename",
  async (c) => {
    const filename =
      c.req.param("filename");

    if (
      !filename ||
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return c.json(
        {
          success: false,
          error: "Invalid video filename."
        },
        400
      );
    }

    try {
      return await withDb(
        c,
        async (client) => {
          const result =
            await client.query(
              `
                SELECT
                  "videoFilename",
                  "videoMimeType",
                  "videoSize"
                FROM videos
                WHERE "videoFilename" = $1
                LIMIT 1
              `,
              [filename]
            );

          if (
            result.rowCount === 0
          ) {
            return c.json(
              {
                success: false,
                error: "Video not found."
              },
              404
            );
          }

          const video =
            result.rows[0];

          const key =
            `videos/${filename}`;

          const metadata =
            await c.env.MEDIA.head(
              key
            );

          if (!metadata) {
            return c.json(
              {
                success: false,
                error:
                  "Video file not found."
              },
              404
            );
          }

          const fileSize =
            metadata.size;

          const mimeType =
            video.videoMimeType ||
            "application/octet-stream";

          const range =
            c.req.header("Range");

          /*
           * No Range header:
           * return the full video.
           */
          if (!range) {
            const object =
              await c.env.MEDIA.get(
                key
              );

            if (!object) {
              return c.json(
                {
                  success: false,
                  error:
                    "Video file not found."
                },
                404
              );
            }

            const headers =
              new Headers();

            headers.set(
              "Content-Type",
              mimeType
            );

            headers.set(
              "Content-Length",
              String(fileSize)
            );

            headers.set(
              "Accept-Ranges",
              "bytes"
            );

            headers.set(
              "Cache-Control",
              "public, max-age=3600"
            );

            if (
              object.httpEtag
            ) {
              headers.set(
                "ETag",
                object.httpEtag
              );
            }

            return new Response(
              object.body,
              {
                status: 200,
                headers
              }
            );
          }

          /*
           * Only one bytes range
           * is supported.
           */
          if (
            !range.startsWith(
              "bytes="
            ) ||
            range.includes(",")
          ) {
            return new Response(
              null,
              {
                status: 416,
                headers: {
                  "Content-Range":
                    `bytes */${fileSize}`,
                  "Accept-Ranges":
                    "bytes"
                }
              }
            );
          }

          const [
            startText,
            endText
          ] = range
            .slice(6)
            .split("-");

          let start;
          let end;

          /*
           * Suffix range:
           * bytes=-500
           */
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
              return new Response(
                null,
                {
                  status: 416,
                  headers: {
                    "Content-Range":
                      `bytes */${fileSize}`,
                    "Accept-Ranges":
                      "bytes"
                  }
                }
              );
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
            return new Response(
              null,
              {
                status: 416,
                headers: {
                  "Content-Range":
                    `bytes */${fileSize}`,
                  "Accept-Ranges":
                    "bytes"
                }
              }
            );
          }

          end =
            Math.min(
              end,
              fileSize - 1
            );

          const chunkSize =
            end - start + 1;

          const object =
            await c.env.MEDIA.get(
              key,
              {
                range: {
                  offset: start,
                  length: chunkSize
                }
              }
            );

          if (!object) {
            return c.json(
              {
                success: false,
                error:
                  "Video file not found."
              },
              404
            );
          }

          const headers =
            new Headers();

          headers.set(
            "Content-Type",
            mimeType
          );

          headers.set(
            "Accept-Ranges",
            "bytes"
          );

          headers.set(
            "Content-Range",
            `bytes ${start}-${end}/${fileSize}`
          );

          headers.set(
            "Content-Length",
            String(chunkSize)
          );

          headers.set(
            "Cache-Control",
            "public, max-age=3600"
          );

          if (
            object.httpEtag
          ) {
            headers.set(
              "ETag",
              object.httpEtag
            );
          }

          return new Response(
            object.body,
            {
              status: 206,
              headers
            }
          );
        }
      );
    } catch (error) {
      console.error(
        "Video stream error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Could not stream video."
        },
        500
      );
    }
  }
);


// =====================================================
// Authentication
// =====================================================

const AUTH_COOKIE_NAME = "websiteKarabubiSession";
const AUTH_COOKIE_MAX_AGE_SECONDS = 2 * 60 * 60;

const jwtKey = (secret) =>
  new TextEncoder().encode(secret);

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  username: user.username,
  email: user.email,
  isVerified: user.isVerified,
  role: user.role
});

const getCookieValue = (request, name) => {
  const cookieHeader =
    request.header("Cookie") || "";

  const cookies =
    cookieHeader.split(";");

  for (const cookie of cookies) {
    const separator =
      cookie.indexOf("=");

    if (separator === -1) {
      continue;
    }

    const key =
      cookie.slice(0, separator).trim();

    if (key !== name) {
      continue;
    }

    const value =
      cookie.slice(separator + 1).trim();

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return "";
};

const getAuthToken = (c) => {
  const authorization =
    c.req.header("Authorization") || "";

  const bearerToken =
    authorization.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

  const cookieToken =
    getCookieValue(
      c.req,
      AUTH_COOKIE_NAME
    );

  // Preserve the old backend behavior:
  // cookie first, then Bearer token.
  return cookieToken || bearerToken;
};

const createAuthToken = async (
  user,
  secret
) => {
  return new SignJWT({
    id: user.id,
    username: user.username,
    email: user.email
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT"
    })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(jwtKey(secret));
};

const verifyAuthToken = async (
  token,
  secret
) => {
  const { payload } =
    await jwtVerify(
      token,
      jwtKey(secret),
      {
        algorithms: ["HS256"]
      }
    );

  return payload;
};

const authenticateRequest =
  async (c) => {
    const token = getAuthToken(c);

    if (!token) {
      return {
        ok: false,
        response: c.json(
          {
            success: false,
            error:
              "Authentication required."
          },
          401
        )
      };
    }

    try {
      const user =
        await verifyAuthToken(
          token,
          c.env.JWT_SECRET
        );

      return {
        ok: true,
        user,
        token
      };
    } catch {
      return {
        ok: false,
        response: c.json(
          {
            success: false,
            error:
              "Invalid or expired authentication token."
          },
          401
        )
      };
    }
  };


const authorizeAdminRequest =
  async (c) => {
    const auth =
      await authenticateRequest(c);

    if (!auth.ok) {
      return auth;
    }

    try {
      return await withDb(
        c,
        async (client) => {
          const result =
            await client.query(
              `
                SELECT
                  id,
                  role
                FROM "Users"
                WHERE id = $1
                LIMIT 1
              `,
              [auth.user.id]
            );

          if (
            result.rowCount === 0
          ) {
            return {
              ok: false,
              response: c.json(
                {
                  success: false,
                  error: "User not found."
                },
                401
              )
            };
          }

          const user =
            result.rows[0];

          if (
            user.role !== "admin"
          ) {
            return {
              ok: false,
              response: c.json(
                {
                  success: false,
                  error:
                    "Administrator access required."
                },
                403
              )
            };
          }

          return {
            ok: true,
            user: {
              ...auth.user,
              role: user.role
            },
            adminUser: user,
            token: auth.token
          };
        }
      );
    } catch (error) {
      console.error(
        "Admin authorization error:",
        error
      );

      return {
        ok: false,
        response: c.json(
          {
            success: false,
            error:
              "Unable to verify administrator access."
          },
          500
        )
      };
    }
  };

app.get(
  "/api/admin-test",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    return c.json({
      success: true,
      admin: true,
      userId: admin.user.id
    });
  }
);


app.post(
  "/api/auth/register",
  async (c) => {
    const admin =
      await authorizeAdminRequest(c);

    if (!admin.ok) {
      return admin.response;
    }

    try {
      let {
        name,
        username,
        email,
        password
      } =
        await c.req.json();

      name =
        String(name || "").trim();

      username =
        String(username || "")
          .trim()
          .toLowerCase();

      email =
        String(email || "")
          .trim()
          .toLowerCase();

      password =
        String(password || "");

      if (
        !name ||
        !username ||
        !email ||
        !password
      ) {
        return c.json(
          {
            success: false,
            error:
              "All fields are required."
          },
          400
        );
      }

      if (name.length < 2) {
        return c.json(
          {
            success: false,
            error:
              "Name must contain at least 2 characters."
          },
          400
        );
      }

      if (username.length < 3) {
        return c.json(
          {
            success: false,
            error:
              "Username must contain at least 3 characters."
          },
          400
        );
      }

      const atIndex =
        email.indexOf("@");

      const lastDotIndex =
        email.lastIndexOf(".");

      const isValidEmail =
        atIndex > 0 &&
        lastDotIndex >
          atIndex + 1 &&
        lastDotIndex <
          email.length - 1;

      if (!isValidEmail) {
        return c.json(
          {
            success: false,
            error:
              "Please enter a valid email address."
          },
          400
        );
      }

      if (password.length < 8) {
        return c.json(
          {
            success: false,
            error:
              "Password must contain at least 8 characters."
          },
          400
        );
      }

      return await withDb(
        c,
        async (client) => {
          const existing =
            await client.query(
              `
                SELECT
                  id,
                  email,
                  username
                FROM "Users"
                WHERE
                  email = $1
                  OR username = $2
                LIMIT 1
              `,
              [
                email,
                username
              ]
            );

          if (
            existing.rowCount > 0
          ) {
            const user =
              existing.rows[0];

            if (
              user.email === email
            ) {
              return c.json(
                {
                  success: false,
                  error:
                    "An account with this email already exists."
                },
                409
              );
            }

            return c.json(
              {
                success: false,
                error:
                  "This username is already taken."
              },
              409
            );
          }

          const hashedPassword =
            await bcrypt.hash(
              password,
              12
            );

          const result =
            await client.query(
              `
                INSERT INTO "Users"
                (
                  name,
                  username,
                  email,
                  password,
                  "isVerified",
                  role,
                  "createdAt",
                  "updatedAt"
                )
                VALUES
                (
                  $1,
                  $2,
                  $3,
                  $4,
                  false,
                  'user',
                  NOW(),
                  NOW()
                )
                RETURNING
                  id,
                  name,
                  username,
                  email,
                  "isVerified",
                  role
              `,
              [
                name,
                username,
                email,
                hashedPassword
              ]
            );

          return c.json(
            {
              success: true,
              message:
                "Account created successfully.",
              user:
                result.rows[0]
            },
            201
          );
        }
      );
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to create account."
        },
        500
      );
    }
  }
);

app.post(
  "/api/auth/login",
  async (c) => {
    try {
      const body =
        await c.req.json();

      const identifier =
        String(
          body.identifier ||
          body.username ||
          body.email ||
          ""
        )
          .trim()
          .toLowerCase();

      const password =
        String(body.password || "");

      if (!identifier || !password) {
        return c.json(
          {
            success: false,
            error:
              "Username/email and password are required."
          },
          400
        );
      }

      return await withDb(
        c,
        async (client) => {
          const result =
            await client.query(
              `
                SELECT
                  id,
                  name,
                  username,
                  email,
                  password,
                  "isVerified",
                  role
                FROM "Users"
                WHERE
                  LOWER(username) = LOWER($1)
                  OR
                  LOWER(email) = LOWER($1)
                LIMIT 1
              `,
              [identifier]
            );

          if (
            result.rowCount === 0
          ) {
            return c.json(
              {
                success: false,
                error:
                  "Invalid username/email or password."
              },
              401
            );
          }

          const user =
            result.rows[0];

          const passwordValid =
            await bcrypt.compare(
              password,
              user.password
            );

          if (!passwordValid) {
            return c.json(
              {
                success: false,
                error:
                  "Invalid username/email or password."
              },
              401
            );
          }

          const token =
            await createAuthToken(
              user,
              c.env.JWT_SECRET
            );

          c.header(
            "Set-Cookie",
            `${AUTH_COOKIE_NAME}=${encodeURIComponent(
              token
            )}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}`
          );

          return c.json({
            success: true,
            token,
            user: publicUser(user)
          });
        }
      );
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to sign in."
        },
        500
      );
    }
  }
);

app.get(
  "/api/auth/me",
  async (c) => {
    const auth =
      await authenticateRequest(c);

    if (!auth.ok) {
      return auth.response;
    }

    try {
      return await withDb(
        c,
        async (client) => {
          const result =
            await client.query(
              `
                SELECT
                  id,
                  name,
                  username,
                  email,
                  "isVerified",
                  role
                FROM "Users"
                WHERE id = $1
                LIMIT 1
              `,
              [auth.user.id]
            );

          if (
            result.rowCount === 0
          ) {
            return c.json(
              {
                success: false,
                error:
                  "User not found."
              },
              404
            );
          }

          return c.json({
            success: true,
            user:
              publicUser(
                result.rows[0]
              )
          });
        }
      );
    } catch (error) {
      console.error(
        "Profile error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to load user profile."
        },
        500
      );
    }
  }
);

app.post(
  "/api/auth/logout",
  (c) => {
    c.header(
      "Set-Cookie",
      `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`
    );

    return c.json({
      success: true
    });
  }
);



// =====================================================
// Private dashboard + private R2 listings
// =====================================================

const privateExtractOriginalName = (filename) => {
  const pieces =
    String(filename || "").split("__");

  if (pieces.length >= 3) {
    return pieces.slice(2).join("__");
  }

  return filename;
};

const privateTimestampFromFilename = (filename) => {
  const value =
    Number(String(filename || "").split("__")[0]);

  if (
    Number.isFinite(value) &&
    value > 0
  ) {
    return new Date(value).toISOString();
  }

  return null;
};

const privatePhotoMimeType = (filename) => {
  const lower =
    String(filename || "").toLowerCase();

  if (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg")
  ) {
    return "image/jpeg";
  }

  if (lower.endsWith(".png")) {
    return "image/png";
  }

  if (lower.endsWith(".webp")) {
    return "image/webp";
  }

  return "application/octet-stream";
};

const privateDocumentMimeType = (filename) => {
  const lower =
    String(filename || "").toLowerCase();

  if (lower.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (lower.endsWith(".doc")) {
    return "application/msword";
  }

  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  if (lower.endsWith(".xls")) {
    return "application/vnd.ms-excel";
  }

  if (lower.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  if (lower.endsWith(".csv")) {
    return "text/csv";
  }

  if (lower.endsWith(".txt")) {
    return "text/plain";
  }

  return "application/octet-stream";
};

app.get(
  "/api/private/dashboard",
  async (c) => {
    const auth =
      await authenticateRequest(c);

    if (!auth.ok) {
      return auth.response;
    }

    try {
      return await withDb(
        c,
        async (client) => {
          const result =
            await client.query(
              `
                SELECT
                  id,
                  name,
                  username,
                  email
                FROM "Users"
                WHERE id = $1
                LIMIT 1
              `,
              [auth.user.id]
            );

          if (
            result.rowCount === 0
          ) {
            return c.json(
              {
                success: false,
                error: "User not found."
              },
              404
            );
          }

          const user =
            result.rows[0];

          return c.json({
            success: true,
            message:
              `Welcome to your private dashboard, ${user.name}!`,
            user
          });
        }
      );
    } catch (error) {
      console.error(
        "Private dashboard error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to load dashboard."
        },
        500
      );
    }
  }
);

app.get(
  "/api/private/photos",
  async (c) => {
    const auth =
      await authenticateRequest(c);

    if (!auth.ok) {
      return auth.response;
    }

    try {
      const prefix =
        `private-photos/${auth.user.id}/`;

      let cursor;
      const objects = [];

      do {
        const result =
          await c.env.MEDIA.list({
            prefix,
            cursor
          });

        objects.push(
          ...result.objects
        );

        cursor =
          result.truncated
            ? result.cursor
            : undefined;
      } while (cursor);

      const photos =
        objects
          .map((object) => {
            const storedFilename =
              object.key.slice(
                prefix.length
              );

            const encoded =
              encodeURIComponent(
                storedFilename
              );

            const uploadedAt =
              privateTimestampFromFilename(
                storedFilename
              ) ||
              object.uploaded?.toISOString?.() ||
              new Date().toISOString();

            return {
              id: storedFilename,
              filename:
                privateExtractOriginalName(
                  storedFilename
                ),
              storedFilename,
              size: object.size,
              mimeType:
                privatePhotoMimeType(
                  storedFilename
                ),
              uploadedAt,
              updatedAt: uploadedAt,
              viewUrl:
                `/private/photos/${encoded}/view`,
              downloadUrl:
                `/private/photos/${encoded}/download`
            };
          })
          .filter(
            (photo) =>
              photo.storedFilename &&
              !photo.storedFilename.startsWith(".")
          )
          .sort(
            (a, b) =>
              new Date(b.uploadedAt) -
              new Date(a.uploadedAt)
          );

      return c.json({
        success: true,
        count: photos.length,
        photos
      });
    } catch (error) {
      console.error(
        "List private photos error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to load photos."
        },
        500
      );
    }
  }
);

app.get(
  "/api/private/documents",
  async (c) => {
    const auth =
      await authenticateRequest(c);

    if (!auth.ok) {
      return auth.response;
    }

    try {
      const prefix =
        `private-documents/${auth.user.id}/`;

      let cursor;
      const objects = [];

      do {
        const result =
          await c.env.MEDIA.list({
            prefix,
            cursor
          });

        objects.push(
          ...result.objects
        );

        cursor =
          result.truncated
            ? result.cursor
            : undefined;
      } while (cursor);

      const documents =
        objects
          .map((object) => {
            const storedFilename =
              object.key.slice(
                prefix.length
              );

            const encoded =
              encodeURIComponent(
                storedFilename
              );

            const uploadedAt =
              privateTimestampFromFilename(
                storedFilename
              ) ||
              object.uploaded?.toISOString?.() ||
              new Date().toISOString();

            return {
              id: storedFilename,
              filename:
                privateExtractOriginalName(
                  storedFilename
                ),
              storedFilename,
              size: object.size,
              mimeType:
                privateDocumentMimeType(
                  storedFilename
                ),
              uploadedAt,
              updatedAt: uploadedAt,
              viewUrl:
                `/private/documents/${encoded}/view`,
              downloadUrl:
                `/private/documents/${encoded}/download`
            };
          })
          .filter(
            (document) =>
              document.storedFilename &&
              !document.storedFilename.startsWith(".")
          )
          .sort(
            (a, b) =>
              new Date(b.uploadedAt) -
              new Date(a.uploadedAt)
          );

      return c.json({
        success: true,
        count: documents.length,
        documents
      });
    } catch (error) {
      console.error(
        "List private documents error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to load documents."
        },
        500
      );
    }
  }
);



// =====================================================
// Private R2 view / download
// =====================================================

const validatePrivateFilename = (filename) => {
  const value = String(filename || "");

  return (
    value.length > 0 &&
    !value.includes("..") &&
    !value.includes("/") &&
    !value.includes("\\")
  );
};

const privateObjectResponse = async (
  c,
  {
    type,
    mode
  }
) => {
  const auth =
    await authenticateRequest(c);

  if (!auth.ok) {
    return auth.response;
  }

  const filename =
    String(c.req.param("filename") || "");

  const isPhoto =
    type === "photo";

  if (!validatePrivateFilename(filename)) {
    return c.json(
      {
        success: false,
        error: isPhoto
          ? "Invalid photo filename."
          : "Invalid document filename."
      },
      400
    );
  }

  if (!isPhoto) {
    const mime =
      privateDocumentMimeType(filename);

    if (
      mime === "application/octet-stream"
    ) {
      return c.json(
        {
          success: false,
          error: "Invalid document type."
        },
        400
      );
    }
  }

  const prefix =
    isPhoto
      ? "private-photos"
      : "private-documents";

  const key =
    `${prefix}/${auth.user.id}/${filename}`;

  try {
    const object =
      await c.env.MEDIA.get(key);

    if (!object) {
      return c.json(
        {
          success: false,
          error: isPhoto
            ? "Photo not found."
            : "Document not found."
        },
        404
      );
    }

    const originalName =
      privateExtractOriginalName(filename);

    const mimeType =
      isPhoto
        ? privatePhotoMimeType(filename)
        : privateDocumentMimeType(filename);

    const headers =
      new Headers();

    headers.set(
      "Content-Type",
      mimeType
    );

    headers.set(
      "Content-Length",
      String(object.size)
    );

    headers.set(
      "Cache-Control",
      "private, no-store"
    );

    if (mode === "download") {
      headers.set(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(
          originalName
        )}`
      );
    } else if (!isPhoto) {
      headers.set(
        "Content-Disposition",
        `inline; filename*=UTF-8''${encodeURIComponent(
          filename
        )}`
      );
    }

    return new Response(
      object.body,
      {
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error(
      `${mode} private ${type} error:`,
      error
    );

    return c.json(
      {
        success: false,
        error:
          mode === "download"
            ? `Unable to download ${type}.`
            : isPhoto
              ? "Unable to load photo."
              : "Unable to view document."
      },
      500
    );
  }
};

app.get(
  "/api/private/photos/:filename/view",
  (c) =>
    privateObjectResponse(c, {
      type: "photo",
      mode: "view"
    })
);

app.get(
  "/api/private/photos/:filename/download",
  (c) =>
    privateObjectResponse(c, {
      type: "photo",
      mode: "download"
    })
);

app.get(
  "/api/private/documents/:filename/view",
  (c) =>
    privateObjectResponse(c, {
      type: "document",
      mode: "view"
    })
);

app.get(
  "/api/private/documents/:filename/download",
  (c) =>
    privateObjectResponse(c, {
      type: "document",
      mode: "download"
    })
);



// =====================================================
// Private R2 upload / rename / delete
// =====================================================

const PRIVATE_PHOTO_MAX_SIZE =
  10 * 1024 * 1024;

const PRIVATE_DOCUMENT_MAX_SIZE =
  20 * 1024 * 1024;

const PRIVATE_MAX_FILES = 10;

const PRIVATE_PHOTO_MIMES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
  ]);

const PRIVATE_DOCUMENT_EXTENSIONS =
  new Set([
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".csv",
    ".txt"
  ]);

const getPrivateExtension =
  (filename) => {
    const value =
      String(filename || "");

    const dot =
      value.lastIndexOf(".");

    return dot >= 0
      ? value.slice(dot).toLowerCase()
      : "";
  };

const sanitizePrivateOriginalName =
  (value) => {
    const original =
      String(value || "");

    const extension =
      getPrivateExtension(original);

    const withoutExtension =
      extension
        ? original.slice(
            0,
            -extension.length
          )
        : original;

    const base =
      withoutExtension
        .split(/[\\/]/)
        .pop()
        .replace(
          /[^a-zA-Z0-9._-]+/g,
          "-"
        )
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 90) ||
      "photo";

    return `${base}${extension}`;
  };

const createPrivateStoredFilename =
  (originalName) =>
    [
      Date.now(),
      crypto.randomUUID(),
      sanitizePrivateOriginalName(
        originalName
      )
    ].join("__");

const buildPrivateFileResponse =
  ({
    storedFilename,
    size,
    mimeType,
    type,
    uploadedAt,
    updatedAt
  }) => {
    const encoded =
      encodeURIComponent(
        storedFilename
      );

    const base =
      type === "photo"
        ? "/private/photos"
        : "/private/documents";

    return {
      id: storedFilename,
      filename:
        privateExtractOriginalName(
          storedFilename
        ),
      storedFilename,
      size,
      mimeType,
      uploadedAt,
      updatedAt,
      viewUrl:
        `${base}/${encoded}/view`,
      downloadUrl:
        `${base}/${encoded}/download`
    };
  };

const allowedPrivateDocument =
  (file) => {
    const extension =
      getPrivateExtension(file.name);

    if (
      !PRIVATE_DOCUMENT_EXTENSIONS.has(
        extension
      )
    ) {
      return false;
    }

    const expectedMime =
      privateDocumentMimeType(
        file.name
      );

    const generic =
      new Set([
        "application/octet-stream",
        "application/zip",
        "application/x-zip-compressed"
      ]);

    if (
      file.type === expectedMime ||
      generic.has(file.type)
    ) {
      return true;
    }

    if (
      extension === ".csv" &&
      [
        "text/csv",
        "application/csv",
        "text/plain",
        "application/vnd.ms-excel"
      ].includes(file.type)
    ) {
      return true;
    }

    if (
      extension === ".txt" &&
      [
        "text/plain",
        "application/octet-stream"
      ].includes(file.type)
    ) {
      return true;
    }

    return false;
  };

app.post(
  "/api/private/photos",
  async (c) => {
    const auth =
      await authenticateRequest(c);

    if (!auth.ok) {
      return auth.response;
    }

    try {
      const form =
        await c.req.formData();

      const files =
        form
          .getAll("photos")
          .filter(
            (value) =>
              value instanceof File
          );

      if (!files.length) {
        return c.json(
          {
            success: false,
            error:
              "Please select at least one photo."
          },
          400
        );
      }

      if (
        files.length >
        PRIVATE_MAX_FILES
      ) {
        return c.json(
          {
            success: false,
            error:
              "A maximum of 10 photos can be uploaded at once."
          },
          400
        );
      }

      const photos = [];

      for (const file of files) {
        if (
          !PRIVATE_PHOTO_MIMES.has(
            file.type
          )
        ) {
          return c.json(
            {
              success: false,
              error:
                "Only JPG, PNG and WEBP images are allowed."
            },
            400
          );
        }

        if (
          file.size >
          PRIVATE_PHOTO_MAX_SIZE
        ) {
          return c.json(
            {
              success: false,
              error:
                "Photo file is too large."
            },
            400
          );
        }

        const storedFilename =
          createPrivateStoredFilename(
            file.name
          );

        const key =
          `private-photos/${auth.user.id}/${storedFilename}`;

        await c.env.MEDIA.put(
          key,
          file.stream(),
          {
            httpMetadata: {
              contentType: file.type
            }
          }
        );

        const now =
          new Date().toISOString();

        photos.push(
          buildPrivateFileResponse({
            storedFilename,
            size: file.size,
            mimeType: file.type,
            type: "photo",
            uploadedAt: now,
            updatedAt: now
          })
        );
      }

      return c.json(
        {
          success: true,
          message:
            `${photos.length} photo${
              photos.length === 1
                ? ""
                : "s"
            } uploaded successfully.`,
          photos
        },
        201
      );
    } catch (error) {
      console.error(
        "Upload private photos error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to upload photos."
        },
        500
      );
    }
  }
);

app.post(
  "/api/private/documents",
  async (c) => {
    const auth =
      await authenticateRequest(c);

    if (!auth.ok) {
      return auth.response;
    }

    try {
      const form =
        await c.req.formData();

      const files =
        form
          .getAll("documents")
          .filter(
            (value) =>
              value instanceof File
          );

      if (!files.length) {
        return c.json(
          {
            success: false,
            error:
              "Please select at least one document."
          },
          400
        );
      }

      if (
        files.length >
        PRIVATE_MAX_FILES
      ) {
        return c.json(
          {
            success: false,
            error:
              "A maximum of 10 documents can be uploaded at once."
          },
          400
        );
      }

      const documents = [];

      for (const file of files) {
        if (!allowedPrivateDocument(file)) {
          return c.json(
            {
              success: false,
              error:
                "Only PDF, DOC, DOCX, XLS, XLSX, CSV and TXT documents are allowed."
            },
            400
          );
        }

        if (
          file.size >
          PRIVATE_DOCUMENT_MAX_SIZE
        ) {
          return c.json(
            {
              success: false,
              error:
                "Document file is too large."
            },
            400
          );
        }

        const storedFilename =
          createPrivateStoredFilename(
            file.name
          );

        const mimeType =
          privateDocumentMimeType(
            file.name
          );

        const key =
          `private-documents/${auth.user.id}/${storedFilename}`;

        await c.env.MEDIA.put(
          key,
          file.stream(),
          {
            httpMetadata: {
              contentType: mimeType
            }
          }
        );

        const now =
          new Date().toISOString();

        documents.push(
          buildPrivateFileResponse({
            storedFilename,
            size: file.size,
            mimeType,
            type: "document",
            uploadedAt: now,
            updatedAt: now
          })
        );
      }

      return c.json(
        {
          success: true,
          message:
            `${documents.length} document${
              documents.length === 1
                ? ""
                : "s"
            } uploaded successfully.`,
          documents
        },
        201
      );
    } catch (error) {
      console.error(
        "Upload private documents error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to upload documents."
        },
        500
      );
    }
  }
);

app.patch(
  "/api/private/photos/:filename",
  async (c) => {
    const auth =
      await authenticateRequest(c);

    if (!auth.ok) {
      return auth.response;
    }

    const filename =
      String(
        c.req.param("filename") || ""
      );

    if (
      !validatePrivateFilename(
        filename
      )
    ) {
      return c.json(
        {
          success: false,
          error:
            "Invalid photo filename."
        },
        400
      );
    }

    try {
      const body =
        await c.req.json();

      const requestedName =
        String(
          body.filename || ""
        ).trim();

      if (!requestedName) {
        return c.json(
          {
            success: false,
            error:
              "A photo name is required."
          },
          400
        );
      }

      if (
        requestedName.length > 120
      ) {
        return c.json(
          {
            success: false,
            error:
              "Photo name must contain 120 characters or fewer."
          },
          400
        );
      }

      const oldKey =
        `private-photos/${auth.user.id}/${filename}`;

      const oldObject =
        await c.env.MEDIA.get(
          oldKey
        );

      if (!oldObject) {
        return c.json(
          {
            success: false,
            error:
              "Photo not found."
          },
          404
        );
      }

      const originalExtension =
        getPrivateExtension(
          privateExtractOriginalName(
            filename
          )
        );

      const suppliedExtension =
        getPrivateExtension(
          requestedName
        );

      const nameWithoutExtension =
        suppliedExtension
          ? requestedName.slice(
              0,
              -suppliedExtension.length
            )
          : requestedName;

      let requestedBase =
        nameWithoutExtension
          .split(/[\\/]/)
          .pop()
          .replace(
            /[^a-zA-Z0-9._ -]+/g,
            "-"
          )
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 90);

      if (!requestedBase) {
        return c.json(
          {
            success: false,
            error:
              "Please enter a valid photo name."
          },
          400
        );
      }

      const parts =
        filename.split("__");

      if (parts.length < 3) {
        return c.json(
          {
            success: false,
            error:
              "This photo cannot be renamed safely."
          },
          400
        );
      }

      const cleanDisplayName =
        `${requestedBase}${originalExtension}`;

      const newStoredFilename =
        `${parts[0]}__${parts[1]}__${cleanDisplayName}`;

      if (
        newStoredFilename ===
        filename
      ) {
        return c.json({
          success: true,
          message:
            "Photo name unchanged.",
          photo: {
            id: filename,
            filename:
              privateExtractOriginalName(
                filename
              )
          }
        });
      }

      const newKey =
        `private-photos/${auth.user.id}/${newStoredFilename}`;

      if (
        await c.env.MEDIA.head(
          newKey
        )
      ) {
        return c.json(
          {
            success: false,
            error:
              "A photo with this name already exists."
          },
          409
        );
      }

      const mimeType =
        privatePhotoMimeType(
          newStoredFilename
        );

      await c.env.MEDIA.put(
        newKey,
        oldObject.body,
        {
          httpMetadata: {
            contentType: mimeType
          }
        }
      );

      await c.env.MEDIA.delete(
        oldKey
      );

      const uploadedAt =
        privateTimestampFromFilename(
          newStoredFilename
        ) ||
        new Date().toISOString();

      return c.json({
        success: true,
        message:
          `Photo renamed to ${cleanDisplayName}.`,
        photo:
          buildPrivateFileResponse({
            storedFilename:
              newStoredFilename,
            size: oldObject.size,
            mimeType,
            type: "photo",
            uploadedAt,
            updatedAt:
              new Date().toISOString()
          })
      });
    } catch (error) {
      console.error(
        "Rename private photo error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to rename photo."
        },
        500
      );
    }
  }
);

app.patch(
  "/api/private/documents/:filename/rename",
  async (c) => {
    const auth =
      await authenticateRequest(c);

    if (!auth.ok) {
      return auth.response;
    }

    const filename =
      String(
        c.req.param("filename") || ""
      );

    if (
      !validatePrivateFilename(
        filename
      )
    ) {
      return c.json(
        {
          success: false,
          error:
            "Invalid document filename."
        },
        400
      );
    }

    try {
      const body =
        await c.req.json();

      const requestedName =
        String(
          body.filename || ""
        ).trim();

      if (!requestedName) {
        return c.json(
          {
            success: false,
            error:
              "New document filename is required."
          },
          400
        );
      }

      if (
        requestedName.includes("..") ||
        requestedName.includes("/") ||
        requestedName.includes("\\")
      ) {
        return c.json(
          {
            success: false,
            error:
              "Invalid new document filename."
          },
          400
        );
      }

      const currentExtension =
        getPrivateExtension(
          privateExtractOriginalName(
            filename
          )
        );

      const requestedExtension =
        getPrivateExtension(
          requestedName
        );

      if (
        !PRIVATE_DOCUMENT_EXTENSIONS.has(
          currentExtension
        )
      ) {
        return c.json(
          {
            success: false,
            error:
              "Invalid current document type."
          },
          400
        );
      }

      if (
        !PRIVATE_DOCUMENT_EXTENSIONS.has(
          requestedExtension
        )
      ) {
        return c.json(
          {
            success: false,
            error:
              "Invalid new document type."
          },
          400
        );
      }

      if (
        requestedExtension !==
        currentExtension
      ) {
        return c.json(
          {
            success: false,
            error:
              "Changing the document file extension is not allowed."
          },
          400
        );
      }

      const oldKey =
        `private-documents/${auth.user.id}/${filename}`;

      const oldObject =
        await c.env.MEDIA.get(
          oldKey
        );

      if (!oldObject) {
        return c.json(
          {
            success: false,
            error:
              "Document not found."
          },
          404
        );
      }

      const sanitized =
        sanitizePrivateOriginalName(
          requestedName
        );

      const newStoredFilename =
        createPrivateStoredFilename(
          sanitized
        );

      const newKey =
        `private-documents/${auth.user.id}/${newStoredFilename}`;

      if (
        await c.env.MEDIA.head(
          newKey
        )
      ) {
        return c.json(
          {
            success: false,
            error:
              "A document with that filename already exists."
          },
          409
        );
      }

      const mimeType =
        privateDocumentMimeType(
          sanitized
        );

      await c.env.MEDIA.put(
        newKey,
        oldObject.body,
        {
          httpMetadata: {
            contentType: mimeType
          }
        }
      );

      await c.env.MEDIA.delete(
        oldKey
      );

      const now =
        new Date().toISOString();

      return c.json({
        success: true,
        message:
          "Document renamed successfully.",
        document:
          buildPrivateFileResponse({
            storedFilename:
              newStoredFilename,
            size: oldObject.size,
            mimeType,
            type: "document",
            uploadedAt: now,
            updatedAt: now
          })
      });
    } catch (error) {
      console.error(
        "Rename private document error:",
        error
      );

      return c.json(
        {
          success: false,
          error:
            "Unable to rename document."
        },
        500
      );
    }
  }
);

app.delete(
  "/api/private/photos/:filename",
  async (c) => {
    const auth =
      await authenticateRequest(c);

    if (!auth.ok) {
      return auth.response;
    }

    const filename =
      String(
        c.req.param("filename") || ""
      );

    if (
      !validatePrivateFilename(
        filename
      )
    ) {
      return c.json(
        {
          success: false,
          error:
            "Invalid photo filename."
        },
        400
      );
    }

    const key =
      `private-photos/${auth.user.id}/${filename}`;

    const existing =
      await c.env.MEDIA.head(key);

    if (!existing) {
      return c.json(
        {
          success: false,
          error:
            "Photo not found."
        },
        404
      );
    }

    await c.env.MEDIA.delete(key);

    return c.json({
      success: true,
      message:
        "Photo deleted successfully.",
      filename:
        privateExtractOriginalName(
          filename
        ),
      storedFilename: filename
    });
  }
);

app.delete(
  "/api/private/documents/:filename",
  async (c) => {
    const auth =
      await authenticateRequest(c);

    if (!auth.ok) {
      return auth.response;
    }

    const filename =
      String(
        c.req.param("filename") || ""
      );

    if (
      !validatePrivateFilename(
        filename
      )
    ) {
      return c.json(
        {
          success: false,
          error:
            "Invalid document filename."
        },
        400
      );
    }

    const originalName =
      privateExtractOriginalName(
        filename
      );

    const extension =
      getPrivateExtension(
        originalName
      );

    if (
      !PRIVATE_DOCUMENT_EXTENSIONS.has(
        extension
      )
    ) {
      return c.json(
        {
          success: false,
          error:
            "Invalid document type."
        },
        400
      );
    }

    const key =
      `private-documents/${auth.user.id}/${filename}`;

    const existing =
      await c.env.MEDIA.head(key);

    if (!existing) {
      return c.json(
        {
          success: false,
          error:
            "Document not found."
        },
        404
      );
    }

    await c.env.MEDIA.delete(key);

    return c.json({
      success: true,
      message:
        "Document deleted successfully.",
      filename: originalName,
      storedFilename: filename
    });
  }
);


export default app;
