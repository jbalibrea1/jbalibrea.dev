import type { CollectionEntry } from 'astro:content';

export type SortedPost = CollectionEntry<'posts'> & { slug: string };

// Más reciente primero, por fecha de modificación si existe y si no por la de publicación.
// El `id` de la colección ya es el slug (ver `generateId` en content.config.ts).
const getSortedPosts = (posts: CollectionEntry<'posts'>[]): SortedPost[] => {
  return posts
    .map((post) => ({ ...post, slug: post.id }))
    .sort(
      (a, b) =>
        new Date(b.data.modDateTime || b.data.pubDateTime).getTime() -
        new Date(a.data.modDateTime || a.data.pubDateTime).getTime(),
    );
};

export default getSortedPosts;
