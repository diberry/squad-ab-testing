/**
 * Evaluates output by checking for lint warnings/errors.
 * Looks for patterns like "warning", "error", "problems found".
 * Returns 1.0 if clean, reduced score based on issue count.
 */
export async function lintScoreEvaluator(output: string): Promise<number> {
  const warningPattern = /warning/gi;
  const errorPattern = /error/gi;

  const warnings = (output.match(warningPattern) || []).length;
  const errors = (output.match(errorPattern) || []).length;

  const totalIssues = warnings + errors * 2; // errors count double
  if (totalIssues === 0) return 1.0;

  // Each issue reduces score; cap at 0
  return Math.max(0, 1.0 - totalIssues * 0.1);
}
