import { render, type CollectionEntry } from 'astro:content';

/**
 * Tiempo de lectura ("3 mins de lectura") que calcula `remark-reading-time`
 * al renderizar el post. Es el mismo texto que se muestra dentro del post.
 */
export async function getMinutesRead(
  post: CollectionEntry<'posts'>,
): Promise<string> {
  const { remarkPluginFrontmatter } = await render(post);
  return remarkPluginFrontmatter.minutesRead as string;
}
