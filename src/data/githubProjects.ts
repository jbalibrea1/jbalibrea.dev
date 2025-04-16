import type { Github } from '@/interfaces/Github';

export const githubProjects: Github[] = [
  {
    title: 'shortener generator',
    repoUrl: 'https://github.com/jbalibrea1/shortener',
    publicUrl: 'https://sh.jbalibrea.dev',
    pinned: true,
    description:
      "✂️  Acortador de URL's con QR, genera urls únicas como /XyZpwd junto con su QR 😉. Creado con Next.js + shadcn, Node.js, Express y MongoDB",

    tags: ['Next.js', 'Node.js', 'Express', 'MongoDB', 'shadcn'],
  },
  {
    title: 'jbalibrea.dev - Portfolio',
    repoUrl: 'https://github.com/jbalibrea1/jbalibrea.dev',
    description:
      '🚀 Portfolio personal construido con Astro, TypeScript, React y TailwindCSS',
    tags: ['TypeScript', 'Astro', 'Tailwind', 'React', 'Portfolio'],
  },
  {
    title: 'dotfiles',
    repoUrl: 'https://github.com/jbalibrea1/dotfiles',
    description: '✨ Mis dotfiles personales para Nvim, Tmux, i3 y más',
    tags: ['linux', 'lua', 'dotfiles', 'Nvim', 'tmux'],
  },
  {
    title: 'shortener api in different languages',
    repoUrl: 'https://github.com/jbalibrea1/short-url-back',
    pinned: true,
    description: '🌍 API para acortar URLs escrita tanto en express como en Go',
    tags: ['Go', 'Node.js', 'Express'],
  },
  {
    title: 'IdealistaWatch',
    repoUrl: 'https://github.com/borjamorenoMurciaeduca/proyecto-final-daw',
    publicUrl: 'https://idealista-watch.es',
    pinned: true,
    description:
      '🏡 Aplicación web para monitorizar precios y propiedades de Idealista, añadir notas y compartirlas con otros usuarios',
    tags: ['React', 'Laravel', 'MUI', 'MySQL', 'Clean architecture', 'Python'],
  },
  {
    title: 'TODO CS50',
    repoUrl: 'https://github.com/jbalibrea1/cs50-project',
    pinned: true,
    description:
      '📝 Pequeño proyecto TODO creado con Flask, utilizando templates jinja y SQLite como base de datos',
    tags: ['Flask', 'SQLite', 'Bootstrap'],
  },
  {
    title: 'GO',
    repoUrl: 'https://github.com/jbalibrea1/go',
    description: 'Initials go examples',
    tags: ['Go'],
  },
  {
    title: 'Full Stack Open - Deep Dive into Modern Web Development',
    repoUrl: 'https://github.com/jbalibrea1/fullstackopen',
    description: '🧾 Mis soluciones al curso Full Stack Open',
    tags: ['React', 'TypeScript', 'MongoDB', 'Node.js', 'GraphQL', 'Express'],
  },
];

export default githubProjects;
