import React from "react";
import { Link } from "react-router-dom";

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

const focusItems = [
  {
    number: "01",
    label: "Frontend",
    value: "React / TypeScript",
  },
  {
    number: "02",
    label: "Backend",
    value: "Node.js / Express",
  },
  {
    number: "03",
    label: "Database",
    value: "PostgreSQL",
  },
  {
    number: "04",
    label: "Focus",
    value: "Full-Stack Development",
  },
];

function Home() {
  return (
    <main className="home-hero-page">
      <section className="home-hero-shell">
        <div className="home-hero-content">
          <div className="home-availability">
            <span className="home-availability-dot" />
            Available for web development
          </div>

          <div className="home-hero-heading">
            <span className="home-hero-name">
              Saleh Alkarabubi
            </span>

            <h1>
              Full-Stack
              <span> Web Developer</span>
            </h1>
          </div>

          <p className="home-hero-description">
            I build modern, reliable full-stack web
            applications with React, Node.js, Express
            and PostgreSQL, focusing on clean interfaces,
            practical functionality and maintainable
            software.
          </p>

          <div className="home-hero-actions">
            <Link
              to="/photos"
              className="home-primary-button"
            >
              View Projects
              <ArrowIcon />
            </Link>

            <Link
              to="/about"
              className="home-secondary-button"
            >
              About Me
            </Link>

            <Link
              to="/contact"
              className="home-secondary-button"
            >
              Contact Me
            </Link>
          </div>

          <div className="home-tech-section">
            <span className="home-tech-label">
              CORE TECHNOLOGIES
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
            Bonn, Germany
          </div>
        </div>

        <aside className="home-developer-panel">
          <div className="home-panel-header">
            <div className="home-panel-title">
              <span className="home-panel-icon-box">
                <CodeIcon />
              </span>

              <div>
                <span>DEVELOPER PROFILE</span>
                <strong>Technical Focus</strong>
              </div>
            </div>

            <span className="home-panel-status">
              ACTIVE
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
              Modern web applications
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
