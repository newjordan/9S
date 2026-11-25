/** Resolve a file from `public/` for root hosting and project-site hosts. */
export function publicUrl(path: string): string {
  const relative = `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
  return new URL(relative, window.location.href).href;
}
