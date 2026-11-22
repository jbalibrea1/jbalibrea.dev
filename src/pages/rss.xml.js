import rss from '@astrojs/rss';
import { getContainerRenderer as getMDXRenderer } from '@astrojs/mdx/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getCollection, render } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import getSortedPosts from '@utils/getSortedPosts';

// El feed lleva el artículo completo. El HTML se renderiza con el contenedor de Astro
// y se sanea: sin scripts, estilos ni botones (la UI del sitio no tiene sentido en un lector).
// Variantes solo-modo-oscuro (`hidden dark:block`): sin CSS se verían duplicadas
const DARK_ONLY_IMG =
  /<img\b[^>]*\bclass="(?:[^"]*\s)?hidden(?:\s[^"]*)?"[^>]*>/g;

const sanitize = (html, site) =>
  sanitizeHtml(html.replace(DARK_ONLY_IMG, ''), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'figure',
      'figcaption',
      'details',
      'summary',
    ]),
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'width', 'height'],
      code: ['class'],
      th: ['align'],
      td: ['align'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    // Los enlaces y recursos relativos pasan a absolutos para que funcionen fuera del sitio
    transformTags: {
      a: (tag, attribs) => ({
        tagName: tag,
        attribs: { ...attribs, href: absolute(attribs.href, site) },
      }),
      img: (tag, attribs) => ({
        tagName: tag,
        attribs: { ...attribs, src: absolute(attribs.src, site) },
      }),
    },
    // Quita encabezados de anclas, botones de copiar y similares sin contenido útil
    exclusiveFilter: (frame) =>
      frame.tag === 'a' && !frame.text.trim() && !frame.attribs.href,
  });

const absolute = (url, site) => {
  if (!url) return url;
  try {
    return new URL(url, site).toString();
  } catch {
    return url;
  }
};

export async function GET(context) {
  const renderers = await loadRenderers([getMDXRenderer()]);
  const container = await AstroContainer.create({ renderers });
  const posts = getSortedPosts(await getCollection('posts'));

  const items = await Promise.all(
    posts.map(async (post) => {
      const { Content } = await render(post);
      const html = await container.renderToString(Content);
      return {
        title: post.data.title,
        pubDate: post.data.pubDateTime,
        description: post.data.description,
        categories: post.data.tags,
        link: `/blog/${post.slug}/`,
        content: sanitize(html, context.site),
      };
    }),
  );

  return rss({
    title: 'Jorge Balibrea Blog - jbalibrea.dev',
    description:
      'Blog de Jorge Balibrea. En este blog comparto mi pasión por el desarrollo y la tecnología en jbalibrea.dev',
    site: context.site,
    items,
    customData: `<language>es-es</language>`,
  });
}
