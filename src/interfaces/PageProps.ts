import type { Page } from 'astro';
import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export interface PageProps {
  page: Page<Post>;
}

export interface PageDataProps {
  data: Post[];
}
