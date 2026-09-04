import React from "react";
import { useLanguage } from "../context/LanguageContext";

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="contact-icon-svg"
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
      className="contact-icon-svg"
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
    <main className="contact-page">
      <section className="contact-shell">
        <div className="contact-heading">
          <span className="contact-eyebrow">
            {t.contact.eyebrow}
          </span>

          <h1>{t.contact.title}</h1>

          <p>
            {t.contact.description}
          </p>
        </div>

        <div className="contact-card-grid">
          <a
            href="mailto:karabubi66@yahoo.com"
            className="contact-card"
          >
            <span className="contact-card-icon">
              <MailIcon />
            </span>

            <span className="contact-card-copy">
              <small>{t.contact.email}</small>
              <strong>
                karabubi66@yahoo.com
              </strong>
              <span>
                {t.contact.sendEmail}
              </span>
            </span>

            <span
              className="contact-card-arrow"
              aria-hidden="true"
            >
              ↗
            </span>
          </a>

          <a
            href="tel:+4917655105979"
            className="contact-card"
          >
            <span className="contact-card-icon">
              <PhoneIcon />
            </span>

            <span className="contact-card-copy">
              <small>{t.contact.telephone}</small>
              <strong>
                0049 176 55105979
              </strong>
              <span>
                {t.contact.callDirectly}
              </span>
            </span>

            <span
              className="contact-card-arrow"
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
