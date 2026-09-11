import React from "react";
import { useLanguage } from "../context/LanguageContext";

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[27px] w-[27px]"
    >
      <path
        fill="currentColor"
        d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm9 7 8-5H4l8 5Zm0 2.3L3 8.7V17h18V8.7l-9 5.6Z"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[27px] w-[27px]"
    >
      <path
        fill="currentColor"
        d="M6.6 2h3.1l1.5 5.1-2.1 1.7a15.4 15.4 0 0 0 6.1 6.1l1.7-2.1 5.1 1.5v3.1c0 1.4-1.1 2.6-2.5 2.6C10.9 20 4 13.1 4 4.5 4 3.1 5.2 2 6.6 2Z"
      />
    </svg>
  );
}

function Contact() {
  const { t } = useLanguage();

  return (
    <main className="min-h-[calc(100vh-88px)] px-7 pb-[100px] pt-[82px] text-slate-50 max-[720px]:px-5 max-[720px]:pb-[72px] max-[720px]:pt-[52px]">
      <section className="mx-auto w-[min(1050px,100%)]">
        <div className="max-w-[720px] [&>h1]:mb-[14px] [&>h1]:mt-[10px] [&>h1]:text-[clamp(2.8rem,7vw,5rem)] [&>h1]:leading-none [&>h1]:tracking-[-0.055em] [&>h1]:text-slate-50 [&>p]:m-0 [&>p]:text-[1.1rem] [&>p]:leading-[1.75] [&>p]:text-slate-400">
          <span className="text-[0.76rem] font-extrabold tracking-[0.16em] text-blue-400">
            {t.contact.eyebrow}
          </span>

          <h1>{t.contact.title}</h1>

          <p>
            {t.contact.description}
          </p>
        </div>

        <div className="mt-[46px] grid grid-cols-2 gap-[18px] max-[720px]:grid-cols-1">
          <a
            href="mailto:karabubi66@yahoo.com"
            className="flex min-h-[150px] items-center gap-[18px] rounded-[22px] border border-[rgba(148,163,184,0.15)] bg-[linear-gradient(145deg,rgba(15,23,42,0.88),rgba(8,15,31,0.8))] p-[26px] text-slate-50 no-underline shadow-[0_20px_50px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.025)] transition-[transform,border-color,box-shadow] duration-[180ms] ease-out hover:-translate-y-1 hover:border-[rgba(96,165,250,0.55)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.24),0_0_30px_rgba(59,130,246,0.08)]"
          >
            <span className="grid h-14 w-14 basis-14 shrink-0 place-items-center rounded-2xl border border-[rgba(96,165,250,0.18)] bg-[rgba(59,130,246,0.12)] text-blue-300">
              <MailIcon />
            </span>

            <span className="flex min-w-0 flex-col gap-[5px] [&>small]:text-[0.72rem] [&>small]:font-extrabold [&>small]:uppercase [&>small]:tracking-[0.11em] [&>small]:text-blue-400 [&>strong]:text-base [&>strong]:text-slate-50 [&>strong]:[overflow-wrap:anywhere] [&>span]:text-[0.84rem] [&>span]:text-[#7d8da3]">
              <small>{t.contact.email}</small>
              <strong>
                karabubi66@yahoo.com
              </strong>
              <span>
                {t.contact.sendEmail}
              </span>
            </span>

            <span
              className="ml-auto text-[1.3rem] text-blue-400"
              aria-hidden="true"
            >
              ↗
            </span>
          </a>

          <a
            href="tel:+4917655105979"
            className="flex min-h-[150px] items-center gap-[18px] rounded-[22px] border border-[rgba(148,163,184,0.15)] bg-[linear-gradient(145deg,rgba(15,23,42,0.88),rgba(8,15,31,0.8))] p-[26px] text-slate-50 no-underline shadow-[0_20px_50px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.025)] transition-[transform,border-color,box-shadow] duration-[180ms] ease-out hover:-translate-y-1 hover:border-[rgba(96,165,250,0.55)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.24),0_0_30px_rgba(59,130,246,0.08)]"
          >
            <span className="grid h-14 w-14 basis-14 shrink-0 place-items-center rounded-2xl border border-[rgba(96,165,250,0.18)] bg-[rgba(59,130,246,0.12)] text-blue-300">
              <PhoneIcon />
            </span>

            <span className="flex min-w-0 flex-col gap-[5px] [&>small]:text-[0.72rem] [&>small]:font-extrabold [&>small]:uppercase [&>small]:tracking-[0.11em] [&>small]:text-blue-400 [&>strong]:text-base [&>strong]:text-slate-50 [&>strong]:[overflow-wrap:anywhere] [&>span]:text-[0.84rem] [&>span]:text-[#7d8da3]">
              <small>{t.contact.telephone}</small>
              <strong>
                0049 176 55105979
              </strong>
              <span>
                {t.contact.callDirectly}
              </span>
            </span>

            <span
              className="ml-auto text-[1.3rem] text-blue-400"
              aria-hidden="true"
            >
              ↗
            </span>
          </a>
        </div>
      </section>
    </main>
  );
}

export default Contact;
