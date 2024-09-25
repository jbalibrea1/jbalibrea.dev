import type { CollectionEntry } from "astro:content";

const getShortedPosts = (posts: CollectionEntry<"posts">[]) => {
  return posts.sort(
    (a, b) =>
      new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime(),
  );
};

export default getShortedPosts;
