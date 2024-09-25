import rss from "@astrojs/rss";
import getShortedPosts from "@utils/getSorterPosts";
import { getCollection } from "astro:content";
export async function GET(context) {
  const posts = await getCollection("posts");
  const sorterPosts = getShortedPosts(posts);
  return rss({
    title: "Jorge Balibrea Blog - jbalibrea.dev",
    description:
      "Blog de Jorge Balibrea enfocado en desarrollo web, tecnología y programación en jbalibrea.dev.",
    site: context.site,
    items: sorterPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/posts/${post.slug}/`,
    })),
    customData: `<language>es-es</language>`,
  });
}
