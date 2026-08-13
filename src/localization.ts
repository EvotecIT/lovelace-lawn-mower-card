import { de } from "./locales/de.ts";
import { en, type TranslationCatalog, type TranslationKey, type TranslationMessage, type TranslationParams } from "./locales/en.ts";
import { fr } from "./locales/fr.ts";
import { it } from "./locales/it.ts";
import { pl } from "./locales/pl.ts";
import { ru } from "./locales/ru.ts";
import { uk } from "./locales/uk.ts";

export type { TranslationKey } from "./locales/en.ts";

export const SUPPORTED_LOCALES = ["en", "de", "fr", "it", "pl", "ru", "uk"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type LocalePreference = SupportedLocale | "auto";

export const LOCALE_OPTIONS: ReadonlyArray<{ value: LocalePreference; label: string }> = [
  { value: "auto", label: "Automatic" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "it", label: "Italiano" },
  { value: "pl", label: "Polski" },
  { value: "ru", label: "Русский" },
  { value: "uk", label: "Українська" },
];

const catalogs: Readonly<Record<SupportedLocale, TranslationCatalog>> = {
  en,
  de,
  fr,
  it,
  pl,
  ru,
  uk,
};

export function normalizeLocale(value: unknown): SupportedLocale | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const language = value.trim().toLowerCase().split(/[-_]/, 1)[0];
  return (SUPPORTED_LOCALES as readonly string[]).includes(language)
    ? (language as SupportedLocale)
    : undefined;
}

export function resolveLocale(
  preference: unknown,
  ...automaticCandidates: unknown[]
): SupportedLocale {
  if (preference !== "auto") {
    const configured = normalizeLocale(preference);
    if (configured) {
      return configured;
    }
  }
  for (const candidate of automaticCandidates) {
    const locale = normalizeLocale(candidate);
    if (locale) {
      return locale;
    }
  }
  return "en";
}

function selectMessage(
  locale: SupportedLocale,
  message: TranslationMessage,
  params: TranslationParams,
): string {
  if (typeof message === "string") {
    return message;
  }
  const count = Number(params.count);
  if (count === 0 && message.zero) {
    return message.zero;
  }
  const category = Number.isFinite(count)
    ? new Intl.PluralRules(locale).select(count)
    : "other";
  return message[category] ?? message.other;
}

function interpolate(message: string, params: TranslationParams): string {
  return message.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (placeholder, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : placeholder,
  );
}

export type Translator = (key: TranslationKey, params?: TranslationParams) => string;

export function createTranslator(locale: SupportedLocale): Translator {
  return (key, params = {}) => {
    const message = catalogs[locale]?.[key] ?? en[key];
    return interpolate(selectMessage(locale, message, params), params);
  };
}

export function catalogKeys(): TranslationKey[] {
  return Object.keys(en) as TranslationKey[];
}

export function catalogFor(locale: SupportedLocale): TranslationCatalog {
  return catalogs[locale];
}
