import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

function removeDupsAndLowerCase(array: string[]) {
  if (!array.length) return array;
  const lowercaseItems = array.map((str) => str.toLowerCase());
  const distinctItems = new Set(lowercaseItems);
  return Array.from(distinctItems);
}

// Define a `type` and `schema` for each collection
const postsCollection = defineCollection({
  // Posts sueltos (`slug.mdx`) o con assets colocados (`slug/index.mdx`).
  // El id es el slug: sin extensión y sin el `/index` final.
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
    generateId: ({ entry }) =>
      entry.replace(/\/index\.mdx?$/, '').replace(/\.mdx?$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      pubDateTime: z.coerce.date(),
      modDateTime: z.coerce.date().optional(),
      description: z.string(),
      author: z.string(),
      // Portada junto al post (`./imagen.png`): se valida y se optimiza
      image: z.object({
        url: image(),
        alt: z.string(),
      }),
      tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
    }),
});

// Export a single `collections` object to register your collection(s)
export const collections = {
  posts: postsCollection,
};
