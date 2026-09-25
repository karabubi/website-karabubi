"use strict";

async function addIfMissing(
  queryInterface,
  table,
  column,
  definition
) {
  const description =
    await queryInterface.describeTable(table);

  if (!description[column]) {
    await queryInterface.addColumn(
      table,
      column,
      definition
    );
  }
}

async function removeIfPresent(
  queryInterface,
  table,
  column
) {
  const description =
    await queryInterface.describeTable(table);

  if (description[column]) {
    await queryInterface.removeColumn(
      table,
      column
    );
  }
}

module.exports = {
  async up(
    queryInterface,
    Sequelize
  ) {
    await addIfMissing(
      queryInterface,
      "videos",
      "titleEn",
      {
        type: Sequelize.STRING(200),
        allowNull: true,
      }
    );

    await addIfMissing(
      queryInterface,
      "videos",
      "titleDe",
      {
        type: Sequelize.STRING(200),
        allowNull: true,
      }
    );

    await addIfMissing(
      queryInterface,
      "videos",
      "titleAr",
      {
        type: Sequelize.STRING(200),
        allowNull: true,
      }
    );

    await addIfMissing(
      queryInterface,
      "videos",
      "descriptionEn",
      {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    );

    await addIfMissing(
      queryInterface,
      "videos",
      "descriptionDe",
      {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    );

    await addIfMissing(
      queryInterface,
      "videos",
      "descriptionAr",
      {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    );

    await queryInterface.sequelize.query(`
      UPDATE "videos"
      SET
        "titleEn" =
          COALESCE(
            "titleEn",
            "title"
          ),

        "descriptionEn" =
          COALESCE(
            "descriptionEn",
            "description"
          )
    `);
  },

  async down(
    queryInterface
  ) {
    await removeIfPresent(
      queryInterface,
      "videos",
      "descriptionAr"
    );

    await removeIfPresent(
      queryInterface,
      "videos",
      "descriptionDe"
    );

    await removeIfPresent(
      queryInterface,
      "videos",
      "descriptionEn"
    );

    await removeIfPresent(
      queryInterface,
      "videos",
      "titleAr"
    );

    await removeIfPresent(
      queryInterface,
      "videos",
      "titleDe"
    );

    await removeIfPresent(
      queryInterface,
      "videos",
      "titleEn"
    );
  },
};
