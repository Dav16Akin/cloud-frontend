import DOMPurify from "dompurify";

/**
 * Cleans HTML from WHMCS (ticket replies) before it is rendered. Returns null
 * when there is no DOM to sanitize with (server render), because DOMPurify
 * then hands the input back untouched — callers should show plain text.
 */
export function sanitizeHtml(dirty: string): string | null {
  if (!DOMPurify.isSupported) return null;
  return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
}
