/**
 * Simple template renderer using {{variable}} placeholders.
 * No external dependencies needed — just string replacement.
 */
export function renderTemplate(
  template: string,
  variables: Record<string, string>,
): string {
  return Object.entries(variables).reduce(
    (result, [key, value]) =>
      result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value),
    template,
  );
}
