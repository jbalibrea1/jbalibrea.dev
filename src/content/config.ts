// Import utilities from `astro:content`
import { defineCollection, z } from 'astro:content';
// Define a `type` and `schema` for each collection
const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDateTime: z.date(),
    modDateTime: z.date().optional(),
    description: z.string(),
    author: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
    tags: z.array(z.string()),
  }),
});
// Export a single `collections` object to register your collection(s)
export const collections = {
  posts: postsCollection,
};
