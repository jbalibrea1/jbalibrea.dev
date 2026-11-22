import type { CollectionEntry } from 'astro:content';

export type SortedPost = CollectionEntry<'posts'> & { slug: string };

// Más reciente primero, siempre por fecha de publicación: editar un post antiguo
// no lo sube ni cambia el anterior/siguiente.
// El `id` de la colección ya es el slug (ver `generateId` en content.config.ts).
const getSortedPosts = (posts: CollectionEntry<'posts'>[]): SortedPost[] => {
  return posts
    .map((post) => ({ ...post, slug: post.id }))
    .sort(
      (a, b) =>
        new Date(b.data.pubDateTime).getTime() -
        new Date(a.data.pubDateTime).getTime(),
    );
};

export default getSortedPosts;
