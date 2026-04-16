/**
 * Parses structured KEY: value text from n8n agents.
 * Handles:
 *   - Uppercase English keys:  VIOLATION_FOUND: yes
 *   - Arabic keys:             الفقرة الأصلية: ...
 *   - Plain paragraphs with no keys (stored under RAW)
 */

const ARABIC_KEY_MAP: Record<string, string> = {
  "الفقرة الأصلية":                  "ORIGINAL_CLAUSE",
  "ملخص المخالفة":                   "VIOLATION_SUMMARY",
  "بديل الشروط باللغة العربية":      "REPLACEMENT_CLAUSE_AR",
  "بديل الشروط باللغة الإنجليزية":   "REPLACEMENT_CLAUSE_EN",
  "مرجع القانون":                    "LAW_REFERENCE",
  "ملاحظات الامتثال":                "COMPLIANCE_NOTES",
  "اسم النظام":                      "LAW_NAME",
  "اسم النظام / القانون":            "LAW_NAME",
  "النص القانوني":                   "LEGAL_TEXT",
  "العقوبة":                         "PENALTY",
  "العقوبة / الجزاء":               "PENALTY",
  "الأثر التجاري":                   "BUSINESS_IMPACT",
  "احتمالية التطبيق":                "ENFORCEMENT_LIKELIHOOD",
  "رمز القانون":                     "LAW_CODE",
  "الجهة المختصة":                   "AUTHORITY",
  "قابل للإصلاح":                    "FIXABLE",
  "مؤكد":                            "CONFIRMATION",
  "درجة الخطورة":                    "SEVERITY",
  "تقدير المخاطر":                   "RISK",
  "المخالفة":                        "VIOLATION_FOUND",
  "وجود مخالفة":                     "VIOLATION_FOUND",
  "البند المخالف":                   "CLAUSE",
  "المشكلة":                         "ISSUE",
  "القانون":                         "LAW",
};

export function parseN8nOutput(raw: string): Record<string, string> {
  if (!raw || !raw.trim()) return {};

  // Normalise Windows/Mac line endings so \r never leaks into values
  const normalised = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const result: Record<string, string> = {};
  let currentKey: string | null = null;
  let currentLines: string[] = [];

  const flush = () => {
    if (currentKey) {
      result[currentKey] = currentLines.join("\n").trim();
    }
  };

  for (const line of normalised.split("\n")) {
    // Try uppercase English key: SOME_KEY: value
    const engMatch = line.match(/^([A-Z][A-Z0-9_]+)\s*:\s*(.*)/);
    if (engMatch) {
      flush();
      currentKey = engMatch[1]!;
      currentLines = [engMatch[2]!];
      continue;
    }

    // Try Arabic key: اسم النظام / القانون: value
    // Key is Arabic text (may include spaces and /) before the first colon
    const arabMatch = line.match(/^([\u0600-\u06FF\s\/]+?)\s*:\s*(.*)/);
    if (arabMatch) {
      const arabicKey = arabMatch[1]!.trim();
      const englishKey = ARABIC_KEY_MAP[arabicKey];
      if (englishKey) {
        flush();
        currentKey = englishKey;
        currentLines = [arabMatch[2]!];
        continue;
      }
    }

    // Continuation line
    if (currentKey) {
      currentLines.push(line);
    }
  }
  flush();

  // Fallback: if nothing was parsed but there is meaningful text, store it as RAW
  if (Object.keys(result).length === 0 && raw.trim()) {
    result["RAW"] = raw.trim();
  }

  return result;
}
