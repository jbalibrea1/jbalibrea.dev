import type { Page } from 'astro';
import type { SortedPost } from '@utils/getSortedPosts';

// Todas las listas de posts salen de getSortedPosts, que añade `slug`
export type Post = SortedPost;
export interface PageProps {
  page: Page<Post>;
}

export interface PageDataProps {
  data: Post[];
}
