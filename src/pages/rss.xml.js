import rss from "@astrojs/rss";
import getShortedPosts from "@utils/getSorterPosts";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("posts");
  const sorterPosts = getShortedPosts(posts);
  return rss({
    title: "Jorge Balibrea Blog - jbalibrea.dev",
    description:
      "Blog de Jorge Balibrea. En este blog comparto mi pasión por el desarrollo y la tecnología en jbalibrea.dev",
    site: context.site,
    items: sorterPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDateTime,
      description: post.data.description,
      link: `/blog/posts/${post.slug}/`,
    })),
    customData: `<language>es-es</language>`,
  });
}
