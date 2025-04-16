import type { CollectionEntry } from 'astro:content';

const getShortedPosts = (posts: CollectionEntry<'posts'>[]) => {
  return posts.sort(
    (a, b) =>
      new Date(b.data.modDateTime || b.data.pubDateTime).getTime() -
      new Date(a.data.modDateTime || a.data.pubDateTime).getTime(),
  );
};

export default getShortedPosts;
