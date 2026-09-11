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

const projectTechnologies = {
  "euroatlas-cargo-platform": [
    "Next.js",
    "NestJS",
    "TypeScript",
    "PostgreSQL",
  ],

  AutoMarket25: [
    "React",
    "Node.js",
    "Express",
    "PostgreSQL",
  ],

  "Delivery-man-system": [
    "JavaScript",
    "Node.js",
    "Express",
  ],

  "website-karabubi": [
    "React",
    "Express",
    "PostgreSQL",
    "JWT",
  ],

  PortfolioSite: [
    "React",
    "JavaScript",
    "CSS",
  ],
};

function getProjectTechnologies(repo) {
  const configured =
    projectTechnologies[repo?.name];

  if (
    Array.isArray(configured) &&
    configured.length > 0
  ) {
    return configured;
  }

  if (repo?.language) {
    return [repo.language];
  }

  return [];
}

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
      className="h-[17px] w-[17px] basis-[17px] shrink-0"
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
      className="h-[17px] w-[17px] basis-[17px] shrink-0"
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
      className="h-[17px] w-[17px] basis-[17px] shrink-0"
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
      className="h-[22px] w-[22px]"
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
    <main className="min-h-[calc(100vh-88px)] px-7 pb-[110px] pt-[72px] text-slate-50 max-[700px]:px-[18px] max-[700px]:pb-[75px] max-[700px]:pt-[50px]">
      <section className="mx-auto w-[min(1240px,100%)]">

        <header className="grid grid-cols-[minmax(0,1.6fr)_minmax(270px,0.55fr)] items-end gap-[42px] max-[900px]:grid-cols-1">
          <div className="max-w-[820px] [&>h1]:my-0 [&>h1]:mb-5 [&>h1]:mt-[17px] [&>h1]:max-w-[800px] [&>h1]:text-[clamp(3rem,7vw,5.7rem)] [&>h1]:leading-[0.98] [&>h1]:tracking-[-0.06em] [&>h1]:text-slate-50 [&>h1>span]:text-[#7395c7] [&>p]:m-0 [&>p]:max-w-[710px] [&>p]:text-[1.06rem] [&>p]:leading-[1.8] [&>p]:text-slate-400 max-[700px]:[&>h1]:text-[clamp(2.7rem,13vw,4.3rem)]">
            <span className="inline-flex items-center gap-[9px] text-[0.74rem] font-extrabold tracking-[0.16em] text-blue-400 before:h-px before:w-7 before:bg-blue-400 before:content-['']">
              {t.projects.kicker}
            </span>

            <h1>
              {t.projects.titleBefore}
              <span>{t.projects.titleHighlight}</span>
            </h1>

            <p>{t.projects.intro}</p>

            <div className="mt-[30px] flex flex-wrap gap-[11px] max-[700px]:grid max-[700px]:grid-cols-1">
              <a
                href="/profiles/github.html"
                className="inline-flex min-h-12 items-center gap-[9px] rounded-[13px] border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.68)] px-[17px] text-[0.9rem] font-[750] text-slate-50 no-underline transition-[transform,border-color,background] duration-[180ms] ease-out hover:-translate-y-0.5 hover:border-[rgba(96,165,250,0.55)] hover:bg-[rgba(30,41,59,0.84)] max-[700px]:justify-center"
              >
                <GitHubIcon />
                <span>{t.projects.githubProfile}</span>
                <span aria-hidden="true">↗</span>
              </a>

              <a
                href="/profiles/linkedin.html"
                className="inline-flex min-h-12 items-center gap-[9px] rounded-[13px] border border-[rgba(56,189,248,0.24)] bg-[rgba(15,23,42,0.68)] px-[17px] text-[0.9rem] font-[750] text-slate-50 no-underline transition-[transform,border-color,background] duration-[180ms] ease-out hover:-translate-y-0.5 hover:border-[rgba(96,165,250,0.55)] hover:bg-[rgba(30,41,59,0.84)] max-[700px]:justify-center"
              >
                <LinkedInIcon />
                <span>{t.projects.linkedinProfile}</span>
                <span aria-hidden="true">↗</span>
              </a>

              <a
                href="/"
                className="inline-flex min-h-12 items-center gap-[9px] rounded-[13px] border border-[rgba(148,163,184,0.2)] bg-[rgba(15,23,42,0.68)] px-[17px] text-[0.9rem] font-[750] text-[#a9b7cb] no-underline transition-[transform,border-color,background] duration-[180ms] ease-out hover:-translate-y-0.5 hover:border-[rgba(96,165,250,0.55)] hover:bg-[rgba(30,41,59,0.84)] max-[700px]:justify-center"
              >
                ← {t.projects.home}
              </a>
            </div>
          </div>

          <aside className="flex min-h-[250px] flex-col justify-center rounded-3xl border border-[rgba(148,163,184,0.14)] bg-[linear-gradient(145deg,rgba(17,28,48,0.9),rgba(7,14,27,0.92))] p-7 shadow-[0_30px_70px_rgba(0,0,0,0.2),inset_0_1px_rgba(255,255,255,0.03)] [&>strong]:mt-2 [&>strong]:text-[4.7rem] [&>strong]:leading-none [&>strong]:tracking-[-0.06em] [&>strong]:text-slate-50 max-[900px]:min-h-0">
            <span className="text-[0.7rem] font-extrabold tracking-[0.13em] text-[#6f88aa]">
              {t.projects.publicWork}
            </span>

            <strong>
              {loading ? "—" : repositories.length}
            </strong>

            <span className="mt-[5px] text-[#8a9bb2]">
              {t.projects.githubProjects}
            </span>

            <div className="my-6 h-px bg-[rgba(148,163,184,0.13)]" />

            <div className="grid grid-cols-2 gap-[15px] [&>div]:flex [&>div]:flex-col [&>div]:gap-1 [&_strong]:text-[0.92rem] [&_strong]:text-blue-100 [&_span]:text-[0.73rem] [&_span]:text-[#63748a]">
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

        <section className="mt-[92px]">
          <div className="mb-[25px] flex items-end justify-between gap-5 [&_h2]:mb-0 [&_h2]:mt-1.5 [&_h2]:text-[clamp(2rem,4vw,3rem)] [&_h2]:tracking-[-0.04em] [&_h2]:text-slate-50 [&_span]:text-[0.7rem] [&_span]:font-extrabold [&_span]:tracking-[0.15em] [&_span]:text-blue-400 [&>p]:m-0 [&>p]:text-[0.83rem] [&>p]:text-slate-500 max-[700px]:flex-col max-[700px]:items-start">
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
            <div className="flex min-h-[150px] items-center justify-center gap-[11px] rounded-[20px] border border-[rgba(148,163,184,0.13)] bg-[rgba(15,23,42,0.55)] p-[30px] text-[#8493a8]">
              <span className="h-[9px] w-[9px] rounded-full bg-blue-400 animate-[projectsPulse_1.2s_infinite_ease-in-out]" />
              {t.projects.loading}
            </div>
          )}

          {loadError && (
            <div className="flex min-h-[150px] flex-col items-center justify-center gap-[11px] rounded-[20px] border border-[rgba(148,163,184,0.13)] bg-[rgba(15,23,42,0.55)] p-[30px] text-[#8493a8] [&>strong]:text-blue-100">
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
              <div className="flex min-h-[150px] flex-col items-center justify-center gap-[11px] rounded-[20px] border border-[rgba(148,163,184,0.13)] bg-[rgba(15,23,42,0.55)] p-[30px] text-[#8493a8] [&>strong]:text-blue-100">
                {t.projects.noRepositories}
              </div>
            )}

          {!loading &&
            !loadError &&
            repositories.length > 0 && (
              <div className="grid grid-cols-2 gap-[17px] max-[700px]:grid-cols-1">
                {repositories.map((repo, index) => (
                  <article
                    className="relative flex min-h-[330px] flex-col overflow-hidden rounded-[21px] border border-[rgba(148,163,184,0.13)] bg-[linear-gradient(145deg,rgba(15,25,44,0.82),rgba(6,13,27,0.88))] p-[25px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-[transform,border-color,box-shadow] duration-[220ms] ease-out after:pointer-events-none after:absolute after:right-0 after:top-0 after:h-[150px] after:w-[150px] after:translate-x-[45%] after:-translate-y-[45%] after:rounded-full after:bg-[rgba(59,130,246,0.06)] after:blur-[45px] after:content-[''] hover:-translate-y-[5px] hover:border-[rgba(96,165,250,0.34)] hover:shadow-[0_27px_65px_rgba(0,0,0,0.22)]"
                    key={repo.id}
                  >
                    <div className="flex items-center justify-between">
                      <div className="grid h-[43px] w-[43px] place-items-center rounded-xl border border-[rgba(96,165,250,0.16)] bg-[rgba(59,130,246,0.08)] text-[#7db4ff]">
                        <CodeIcon />
                      </div>

                      <span className="text-[0.76rem] font-extrabold tracking-[0.1em] text-[#3f526a]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="mt-7 [&>h3]:m-0 [&>h3]:break-words [&>h3]:text-[1.3rem] [&>h3]:leading-[1.35] [&>h3]:tracking-[-0.025em] [&>h3]:text-slate-100 [&>p]:mb-0 [&>p]:mt-3 [&>p]:text-[0.9rem] [&>p]:leading-[1.7] [&>p]:text-[#8291a6]">
                      <h3>{repo.name}</h3>

                      <p>
                        {getDefinition(repo, t.projects.defaultDescription)}
                      </p>
                    </div>

                    <div className="mt-[22px] flex flex-wrap gap-[14px] text-[0.74rem] text-[#607086]">
                      {repo.language && (
                        <span className="inline-flex items-center gap-[7px]">
                          <span className="h-[7px] w-[7px] rounded-full bg-blue-400" />
                          {repo.language}
                        </span>
                      )}

                      {repo.updated_at && (
                        <span>
                          {t.projects.updated} {formatDate(repo.updated_at)}
                        </span>
                      )}
                    </div>

                    {getProjectTechnologies(repo).length > 0 && (
                      <div
                        className="mt-[14px] flex flex-wrap gap-[7px] rtl:[direction:rtl] max-[640px]:mt-3 max-[640px]:gap-1.5"
                        aria-label="Project technologies"
                      >
                        {getProjectTechnologies(repo).map(
                          (technology) => (
                            <span
                              className="inline-flex min-h-7 items-center whitespace-nowrap rounded-full border border-[rgba(96,165,250,0.2)] bg-[rgba(30,41,59,0.62)] px-2.5 py-[5px] text-[0.76rem] font-bold leading-none text-slate-300 max-[640px]:px-[9px] max-[640px]:text-[0.72rem]"
                              key={technology}
                            >
                              {technology}
                            </span>
                          )
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-4 border-t border-[rgba(148,163,184,0.1)] pt-6 max-[700px]:flex-col max-[700px]:items-start max-[640px]:items-stretch">
                      <div className="flex gap-3 text-[0.72rem] text-[#53657b]">
                        <span>
                          ☆ {repo.stargazers_count} {t.projects.stars}
                        </span>

                        <span>
                          {t.projects.forks} {repo.forks_count}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 rtl:[direction:rtl] max-[640px]:w-full max-[420px]:flex-col max-[420px]:items-stretch">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-10 flex-auto items-center justify-center gap-[7px] whitespace-nowrap rounded-[10px] px-[13px] py-[9px] text-[0.79rem] font-bold leading-[1.2] text-[#8fbdff] no-underline transition-[transform,border-color,background-color,color] duration-160 hover:text-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-current max-[640px]:basis-[150px] max-[640px]:grow max-[420px]:w-full max-[420px]:basis-auto max-[420px]:grow-0"
                        >
                          <GitHubIcon />
                          {t.projects.viewRepository}
                        </a>

                        {getLiveDemoUrl(repo) && (
                          <a
                            href={getLiveDemoUrl(repo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-10 flex-initial items-center justify-center gap-[7px] whitespace-nowrap rounded-[10px] border border-[rgba(148,163,184,0.28)] bg-[rgba(15,23,42,0.5)] px-[13px] py-[9px] text-[0.79rem] font-bold leading-[1.2] text-slate-200 no-underline transition-[transform,border-color,background-color,color] duration-160 hover:-translate-y-px hover:border-[rgba(148,163,184,0.55)] hover:bg-[rgba(30,41,59,0.78)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-current max-[640px]:basis-[150px] max-[640px]:grow max-[420px]:w-full max-[420px]:basis-auto max-[420px]:grow-0"
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
