import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="home-arrow-icon"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-5-5 5 5-5 5"
      />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="home-panel-icon"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8 9-3 3 3 3m8-6 3 3-3 3m-2-9-4 12"
      />
    </svg>
  );
}

function getFocusItems(t) {
  return [
    {
      number: "01",
      label: t.home.frontend,
      value: "React / TypeScript",
    },
    {
      number: "02",
      label: t.home.backend,
      value: "Node.js / Express",
    },
    {
      number: "03",
      label: t.home.database,
      value: "PostgreSQL",
    },
    {
      number: "04",
      label: t.home.focus,
      value: t.home.fullStackDevelopment,
    },
  ];
}

function Home() {
  const { t } = useLanguage();
  const focusItems = getFocusItems(t);

  return (
    <main className="home-hero-page">
      <section className="home-hero-shell">
        <div className="home-hero-content">
          <div className="home-availability">
            <span className="home-availability-dot" />
            {t.home.available}
          </div>

          <div className="home-hero-heading">
            <span className="home-hero-name">
              {t.home.name}
            </span>

            <h1>
              {t.home.titleMain}
              <span>{t.home.titleHighlight}</span>
            </h1>
          </div>

          <p className="home-hero-description">
            {t.home.description}
          </p>

          <div className="home-hero-actions">
            <Link
              to="/photos"
              className="home-primary-button"
            >
              {t.home.viewProjects}
              <ArrowIcon />
            </Link>

            <Link
              to="/about"
              className="home-secondary-button"
            >
              {t.home.aboutMe}
            </Link>

            <Link
              to="/contact"
              className="home-secondary-button"
            >
              {t.home.contactMe}
            </Link>
          </div>

          <div className="home-tech-section">
            <span className="home-tech-label">
              {t.home.coreTechnologies}
            </span>

            <div className="home-tech-list">
              <span>React</span>
              <i />
              <span>TypeScript</span>
              <i />
              <span>Node.js</span>
              <i />
              <span>Express</span>
              <i />
              <span>PostgreSQL</span>
            </div>
          </div>

          <div className="home-location">
            <span className="home-location-icon">
              ◎
            </span>
            {t.home.location}
          </div>
        </div>

        <aside className="home-developer-panel">
          <div className="home-panel-header">
            <div className="home-panel-title">
              <span className="home-panel-icon-box">
                <CodeIcon />
              </span>

              <div>
                <span>{t.home.developerProfile}</span>
                <strong>{t.home.technicalFocus}</strong>
              </div>
            </div>

            <span className="home-panel-status">
              {t.home.active}
            </span>
          </div>

          <div className="home-panel-divider" />

          <div className="home-focus-list">
            {focusItems.map((item) => (
              <div
                className="home-focus-item"
                key={item.number}
              >
                <span className="home-focus-number">
                  {item.number}
                </span>

                <div className="home-focus-copy">
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="home-panel-footer">
            <span>
              {t.home.modernWebApplications}
            </span>

            <span className="home-panel-footer-mark">
              SA
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Home;
