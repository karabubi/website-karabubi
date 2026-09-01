import React from "react";
import salehPhoto from "../assets/saleh.jpg";

function DocumentIcon({ type }) {
  if (type === "cv") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="about-doc-button-icon"
      >
        <path
          fill="currentColor"
          d="M6 2h8l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V7h3.5L13 3.5ZM8 11v1.5h6V11H8Zm0 4v1.5h8V15H8Zm0 4v1h5v-1H8Z"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="about-doc-button-icon"
    >
      <path
        fill="currentColor"
        d="M12 2a7 7 0 0 0-4 12.74V22l4-2 4 2v-7.26A7 7 0 0 0 12 2Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm-1 2v3H8v2h3v3h2v-3h3V9h-3V6h-2Z"
      />
    </svg>
  );
}

function About() {
  return (
    <main className="about-page">
      <section className="about-shell">
        <div className="about-profile-column">
          <div className="about-photo-frame">
            <img
              src={salehPhoto}
              alt="Saleh Alkarabubi"
              className="about-profile-photo"
            />
          </div>

          <div className="about-location">
            <span className="about-status-dot" />
            Bonn, Germany
          </div>
        </div>

        <div className="about-content">
          <span className="about-eyebrow">
            ABOUT ME
          </span>

          <h1 className="about-title">
            Saleh Alkarabubi
          </h1>

          <p className="about-role">
            Full-Stack Web Developer
          </p>

          <p className="about-introduction">
            I build modern web applications with a strong
            focus on clean architecture, responsive user
            interfaces and reliable backend systems.
          </p>

          <p className="about-description">
            My current development stack includes React,
            Node.js, Express, REST APIs and PostgreSQL.
            I work with Git and GitHub for version control
            and use modern authentication and API design
            patterns to build maintainable full-stack
            applications.
          </p>

<div className="about-document-actions">
            <a
              href="/documents/view-cv.html"
              className="about-doc-button"
            >
              <span className="about-doc-icon-wrap">
                <DocumentIcon type="cv" />
              </span>

              <span className="about-doc-text">
                <strong>View CV</strong>
                <small>Curriculum Vitae</small>
              </span>

              <span
                className="about-doc-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </a>

            <a
              href="/documents/view-certificates.html"
              className="about-doc-button"
            >
              <span className="about-doc-icon-wrap">
                <DocumentIcon type="certificate" />
              </span>

              <span className="about-doc-text">
                <strong>View Certificates</strong>
                <small>
                  Qualifications & Training
                </small>
              </span>

              <span
                className="about-doc-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;
