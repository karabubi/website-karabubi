import React from "react";
import salehPhoto from "../assets/saleh-about.jpg";
import { useLanguage } from "../context/LanguageContext";

function DocumentIcon({ type }) {
  if (type === "cv") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-6 w-6"
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
      className="h-6 w-6"
    >
      <path
        fill="currentColor"
        d="M12 2a7 7 0 0 0-4 12.74V22l4-2 4 2v-7.26A7 7 0 0 0 12 2Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm-1 2v3H8v2h3v3h2v-3h3V9h-3V6h-2Z"
      />
    </svg>
  );
}

function About() {
  const { t } = useLanguage();

  return (
    <main className="min-h-[calc(100vh-88px)] px-7 pb-[100px] pt-[72px] text-slate-50 max-[640px]:px-5 max-[640px]:pb-[72px] max-[640px]:pt-12">
      <section className="mx-auto grid w-[min(1180px,100%)] grid-cols-[300px_minmax(0,1fr)] items-start gap-[72px] max-[900px]:grid-cols-1 max-[900px]:gap-[42px]">
        <div className="sticky top-[120px] max-[900px]:static max-[900px]:mx-auto max-[900px]:w-[min(300px,72vw)]">
          <div className="relative aspect-square w-full rounded-[32px] bg-[linear-gradient(145deg,rgba(59,130,246,0.95),rgba(99,102,241,0.25))] p-[7px] shadow-[0_28px_70px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.06)]">
            <img
              src={salehPhoto}
              alt={t.about.name}
              className="block h-full w-full rounded-[26px] bg-slate-900 object-cover object-center"
            />
          </div>

          <div className="mt-[18px] flex items-center justify-center gap-[9px] text-[0.92rem] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.7)]" />
            {t.about.location}
          </div>
        </div>

        <div className="min-w-0">
          <span className="inline-block text-[0.76rem] font-extrabold tracking-[0.16em] text-blue-400">
            {t.about.eyebrow}
          </span>

          <h1 className="mt-2.5 text-[clamp(2.7rem,6vw,5rem)] leading-[0.98] tracking-[-0.055em] text-slate-50">
            {t.about.name}
          </h1>

          <p className="mt-4 text-[clamp(1.15rem,2vw,1.45rem)] font-[650] text-blue-300">
            {t.about.role}
          </p>

          <p className="mt-8 max-w-[760px] text-[clamp(1.15rem,2vw,1.35rem)] leading-[1.75] text-slate-200">
            {t.about.introduction}
          </p>

          <p className="mt-[18px] max-w-[780px] text-base leading-[1.85] text-slate-400">
            {t.about.description}
          </p>

<div className="mt-[34px] flex flex-wrap gap-4 max-[640px]:flex-col">
            <a
              href="/documents/view-cv.html"
              className="flex min-h-[78px] min-w-[245px] items-center gap-3.5 rounded-[18px] border border-[rgba(96,165,250,0.25)] bg-[linear-gradient(145deg,rgba(20,31,54,0.96),rgba(12,21,39,0.96))] px-4 py-[13px] text-slate-50 no-underline shadow-[0_16px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.025)] transition-[transform,border-color,box-shadow] duration-[180ms] ease-out hover:-translate-y-[3px] hover:border-[rgba(96,165,250,0.65)] hover:shadow-[0_22px_48px_rgba(0,0,0,0.28),0_0_28px_rgba(59,130,246,0.08)] max-[640px]:w-full max-[640px]:min-w-0"
            >
              <span className="grid h-[46px] w-[46px] basis-[46px] shrink-0 place-items-center rounded-[14px] border border-[rgba(96,165,250,0.18)] bg-[rgba(59,130,246,0.12)] text-blue-300">
                <DocumentIcon type="cv" />
              </span>

              <span className="flex flex-col gap-[3px] [&>strong]:text-[0.98rem] [&>strong]:text-slate-50 [&>small]:text-[0.78rem] [&>small]:text-[#8190a5]">
                <strong>{t.about.viewCv}</strong>
                <small>{t.about.curriculumVitae}</small>
              </span>

              <span
                className="ml-auto text-xl text-blue-400"
                aria-hidden="true"
              >
                ↗
              </span>
            </a>

            <a
              href="/documents/view-certificates.html"
              className="flex min-h-[78px] min-w-[245px] items-center gap-3.5 rounded-[18px] border border-[rgba(96,165,250,0.25)] bg-[linear-gradient(145deg,rgba(20,31,54,0.96),rgba(12,21,39,0.96))] px-4 py-[13px] text-slate-50 no-underline shadow-[0_16px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.025)] transition-[transform,border-color,box-shadow] duration-[180ms] ease-out hover:-translate-y-[3px] hover:border-[rgba(96,165,250,0.65)] hover:shadow-[0_22px_48px_rgba(0,0,0,0.28),0_0_28px_rgba(59,130,246,0.08)] max-[640px]:w-full max-[640px]:min-w-0"
            >
              <span className="grid h-[46px] w-[46px] basis-[46px] shrink-0 place-items-center rounded-[14px] border border-[rgba(96,165,250,0.18)] bg-[rgba(59,130,246,0.12)] text-blue-300">
                <DocumentIcon type="certificate" />
              </span>

              <span className="flex flex-col gap-[3px] [&>strong]:text-[0.98rem] [&>strong]:text-slate-50 [&>small]:text-[0.78rem] [&>small]:text-[#8190a5]">
                <strong>{t.about.viewCertificates}</strong>
                <small>
                  {t.about.qualificationsTraining}
                </small>
              </span>

              <span
                className="ml-auto text-xl text-blue-400"
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
