/**
 * Evaluates output by counting passing vs failing test markers.
 * Looks for patterns like "✓", "PASS", "✗", "FAIL" in the output.
 * Returns a score 0-1 representing the pass rate.
 */
export async function testPassRateEvaluator(output: string): Promise<number> {
  const passPatterns = /(\u2713|PASS|passed|✓)/gi;
  const failPatterns = /(\u2717|FAIL|failed|✗)/gi;

  const passes = (output.match(passPatterns) || []).length;
  const failures = (output.match(failPatterns) || []).length;
  const total = passes + failures;

  if (total === 0) return 0;
  return passes / total;
}
