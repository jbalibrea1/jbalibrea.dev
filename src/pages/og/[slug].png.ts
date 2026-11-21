import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const require = createRequire(import.meta.url);

// satori no soporta woff2: usamos los .woff de @fontsource/inter
const loadFont = (weight: 400 | 700) =>
  readFile(
    require.resolve(
      `@fontsource/inter/files/inter-latin-${weight}-normal.woff`,
    ),
  );

export const getStaticPaths = (async () => {
  const posts = await getCollection('posts');
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}) satisfies GetStaticPaths;

const node = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
) => ({
  type,
  props: { style: { display: 'flex', ...style }, children },
});

export const GET: APIRoute<{
  post: Awaited<ReturnType<typeof getCollection<'posts'>>>[number];
}> = async ({ props }) => {
  const { title, description, tags } = props.post.data;
  const [regular, bold] = await Promise.all([loadFont(400), loadFont(700)]);

  const card = node(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      boxSizing: 'border-box',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 72,
      background: '#0b0b0f',
      color: '#f4f4f5',
      fontFamily: 'Inter',
      borderLeft: '16px solid #e11d48',
    },
    [
      node('div', { flexDirection: 'column', gap: 28 }, [
        node(
          'div',
          {
            fontSize: title.length > 60 ? 56 : 68,
            fontWeight: 700,
            lineHeight: 1.1,
          },
          title,
        ),
        node(
          'div',
          { fontSize: 30, color: '#a1a1aa', lineHeight: 1.35 },
          description.length > 150
            ? `${description.slice(0, 147)}…`
            : description,
        ),
      ]),
      node('div', { justifyContent: 'space-between', alignItems: 'center' }, [
        node(
          'div',
          { gap: 12 },
          tags.slice(0, 3).map((tag) =>
            node(
              'div',
              {
                fontSize: 24,
                color: '#e11d48',
                border: '2px solid #e11d48',
                borderRadius: 999,
                padding: '6px 18px',
              },
              `#${tag}`,
            ),
          ),
        ),
        node('div', { fontSize: 30, fontWeight: 700 }, 'jbalibrea.dev'),
      ]),
    ],
  );

  const svg = await satori(card as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: bold, weight: 700, style: 'normal' },
    ],
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
