export function mergeProfileTags(selected: string[], customInput: string): string[] {
  const customTags = customInput
    .split(/[，,、\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

  return [...new Set([...selected, ...customTags])];
}
