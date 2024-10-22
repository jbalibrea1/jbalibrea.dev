export interface Github {
  name: string;
  repoUrl: string;
  publicUrl?: string | null;
  description: string | null;
  tags: string[];
}
