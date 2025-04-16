import type { Page } from 'astro';
import type { CollectionEntry } from 'astro:content';

export interface PageProps {
  page: Page<CollectionEntry<'posts'>>;
}
