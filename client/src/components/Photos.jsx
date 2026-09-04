import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const GITHUB_USERNAME = "karabubi";

const projectDefinitions = {
  "euroatlas-cargo-platform":
    "Full-stack cargo and vehicle-shipping platform with shipment tracking, inspections, vehicle photos, notifications and operational workflows.",

  AutoMarket25:
    "Full-stack vehicle marketplace project focused on modern web development, authentication and vehicle-management workflows.",

  "Delivery-man-system":
    "Delivery management application designed to support delivery workflows, organization and route-related operations.",

  "website-karabubi":
    "Personal developer portfolio built with React, Express, JWT authentication and PostgreSQL.",

  PortfolioSite:
    "Personal portfolio project for presenting development work, technical skills and professional information.",
};

function getLiveDemoUrl(repo) {
  const value = String(repo?.homepage || "").trim();

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="projects-action-icon"
    >
      <path
        fill="currentColor"
        d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3Zm5 16H5V5h6V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-2v6Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="projects-action-icon"
    >
      <path
        fill="currentColor"
        d="M12 .7a11.3 11.3 0 0 0-3.57 22.03c.57.1.78-.25.78-.55v-2.16c-3.18.69-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.52-2.54-.29-5.21-1.27-5.21-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.11 1.17A10.8 10.8 0 0 1 12 5.96c.96 0 1.93.13 2.83.38 2.15-1.48 3.11-1.17 3.11-1.17.62 1.57.23 2.73.11 3.02.74.8 1.18 1.82 1.18 3.07 0 4.39-2.68 5.35-5.23 5.64.41.35.78 1.05.78 2.12v3.16c0 .3.21.66.79.55A11.3 11.3 0 0 0 12 .7Z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="projects-action-icon"
    >
      <path
        fill="currentColor"
        d="M5.34 3.5A2.34 2.34 0 1 1 .66 3.5a2.34 2.34 0 0 1 4.68 0ZM1 7h4.7v14H1V7Zm7.5 0H13v1.91h.06c.63-1.2 2.17-2.46 4.47-2.46C22.3 6.45 23 9.59 23 13.67V21h-4.68v-6.5c0-1.55-.03-3.54-2.16-3.54-2.16 0-2.49 1.69-2.49 3.43V21H9V7h-.5Z"
      />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="project-code-icon"
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

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getDefinition(repo, fallbackDescription) {
  if (repo.description) {
    return repo.description;
  }

  if (projectDefinitions[repo.name]) {
    return projectDefinitions[repo.name];
  }

  return fallbackDescription;
}

function Photos() {
  const { t } = useLanguage();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRepositories() {
      try {
        const response = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/vnd.github+json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `GitHub request failed: ${response.status}`
          );
        }

        const data = await response.json();

        const publicProjects = data.filter(
          (repo) => !repo.fork
        );

        setRepositories(publicProjects);
        setLoadError(false);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          setLoadError(true);
        }
      } finally {
        setLoading(false);
      }
    }

    loadRepositories();

    return () => controller.abort();
  }, []);

  const languageCount = useMemo(() => {
    const languages = new Set(
      repositories
        .map((repo) => repo.language)
        .filter(Boolean)
    );

    return languages.size;
  }, [repositories]);

  return (
    <main className="projects-modern-page">
      <section className="projects-modern-shell">

        <header className="projects-modern-hero">
          <div className="projects-modern-intro">
            <span className="projects-modern-kicker">
              {t.projects.kicker}
            </span>

            <h1>
              {t.projects.titleBefore}
              <span>{t.projects.titleHighlight}</span>
            </h1>

            <p>{t.projects.intro}</p>

            <div className="projects-modern-actions">
              <a
                href="/profiles/github.html"
                className="projects-profile-button"
              >
                <GitHubIcon />
                <span>{t.projects.githubProfile}</span>
                <span aria-hidden="true">↗</span>
              </a>

              <a
                href="/profiles/linkedin.html"
                className="projects-profile-button projects-linkedin-button"
              >
                <LinkedInIcon />
                <span>{t.projects.linkedinProfile}</span>
                <span aria-hidden="true">↗</span>
              </a>

              <a
                href="/"
                className="projects-home-button"
              >
                ← {t.projects.home}
              </a>
            </div>
          </div>

          <aside className="projects-summary-card">
            <span className="projects-summary-label">
              {t.projects.publicWork}
            </span>

            <strong>
              {loading ? "—" : repositories.length}
            </strong>

            <span>
              {t.projects.githubProjects}
            </span>

            <div className="projects-summary-divider" />

            <div className="projects-summary-meta">
              <div>
                <strong>
                  {loading ? "—" : languageCount}
                </strong>
                <span>{t.projects.languages}</span>
              </div>

              <div>
                <strong>{t.projects.fullStack}</strong>
                <span>{t.projects.primaryFocus}</span>
              </div>
            </div>
          </aside>
        </header>

        <section className="projects-work-section">
          <div className="projects-section-heading">
            <div>
              <span>{t.projects.allProjects}</span>
              <h2>{t.projects.repositories}</h2>
            </div>

            {!loading && !loadError && (
              <p>
                {repositories.length} {t.projects.publicProjects}
              </p>
            )}
          </div>

          {loading && (
            <div className="projects-loading">
              <span className="projects-loading-dot" />
              {t.projects.loading}
            </div>
          )}

          {loadError && (
            <div className="projects-error">
              <strong>
                {t.projects.loadError}
              </strong>

              <span>
                {t.projects.loadErrorHelp}
              </span>
            </div>
          )}

          {!loading &&
            !loadError &&
            repositories.length === 0 && (
              <div className="projects-error">
                {t.projects.noRepositories}
              </div>
            )}

          {!loading &&
            !loadError &&
            repositories.length > 0 && (
              <div className="projects-modern-grid">
                {repositories.map((repo, index) => (
                  <article
                    className="projects-modern-card"
                    key={repo.id}
                  >
                    <div className="project-modern-top">
                      <div className="project-modern-icon">
                        <CodeIcon />
                      </div>

                      <span className="project-modern-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="project-modern-content">
                      <h3>{repo.name}</h3>

                      <p>
                        {getDefinition(repo, t.projects.defaultDescription)}
                      </p>
                    </div>

                    <div className="project-modern-details">
                      {repo.language && (
                        <span className="project-language">
                          <span className="project-language-dot" />
                          {repo.language}
                        </span>
                      )}

                      {repo.updated_at && (
                        <span>
                          {t.projects.updated} {formatDate(repo.updated_at)}
                        </span>
                      )}
                    </div>

                    <div className="project-modern-footer">
                      <div className="project-modern-stats">
                        <span>
                          ☆ {repo.stargazers_count} {t.projects.stars}
                        </span>

                        <span>
                          {t.projects.forks} {repo.forks_count}
                        </span>
                      </div>

                      <div className="project-card-actions">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-repository-link"
                        >
                          <GitHubIcon />
                          {t.projects.viewRepository}
                        </a>

                        {getLiveDemoUrl(repo) && (
                          <a
                            href={getLiveDemoUrl(repo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="project-live-link"
                          >
                            <ExternalLinkIcon />
                            {t.projects.liveDemo}
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </section>

      </section>
    </main>
  );
}

export default Photos;
