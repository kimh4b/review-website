// Shared helpers for consistent rating and comment extraction across all dashboard components

/**
 * Convert yes/no answer to star rating:
 * "Yes" = 3 stars (neutral/positive)
 * "No" = 2 stars (negative)
 */
function yesNoToStar(answer: any): number | null {
  if (typeof answer !== "string") return null;
  const lower = answer.toLowerCase().trim();
  if (lower === "yes") return 3;
  if (lower === "no") return 2;
  return null;
}

/**
 * Extract main rating by averaging:
 * - All rating questions (1-5)
 * - All yes/no questions converted to stars (yes=3, no=2)
 * Multiple choice and text are ignored.
 */
export function extractMainRating(
  answers: Record<string, any>,
  questionTypeMap: Record<string, string>
): number {
  const allValues: number[] = [];

  Object.entries(answers).forEach(([key, value]) => {
    const type = questionTypeMap[key];

    if (type === "rating") {
      const num = typeof value === "number" ? value : parseInt(value);
      if (num >= 1 && num <= 5) allValues.push(num);
    }

    if (type === "yes-no") {
      const converted = yesNoToStar(value);
      if (converted !== null) allValues.push(converted);
    }
  });

  if (allValues.length === 0) return 3; // default neutral
  return Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length);
}

/**
 * Extract comment from answers — only from "text" type questions.
 */
export function extractComment(
  answers: Record<string, any>,
  questionTypeMap: Record<string, string>
): string {
  return Object.entries(answers)
    .filter(([key]) => questionTypeMap[key] === "text")
    .map(([, value]) => typeof value === "string" ? value.trim() : "")
    .filter(v => v.length > 0)
    .join(" • ");
}

/**
 * Determine sentiment from rating.
 */
export function getSentiment(rating: number): "positive" | "neutral" | "negative" {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "negative";
}

/**
 * Human readable time ago string.
 */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}