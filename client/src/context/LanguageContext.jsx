import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import en from "../translations/en";
import de from "../translations/de";
import ar from "../translations/ar";

const dictionaries = {
  en,
  de,
  ar,
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("siteLanguage") || "en";
  });

  useEffect(() => {
    localStorage.setItem(
      "siteLanguage",
      language
    );

    document.documentElement.lang = language;

    document.documentElement.dir =
      language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const value = useMemo(() => {
    return {
      language,
      setLanguage,
      t: dictionaries[language] || dictionaries.en,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
