import type { Github } from "@/interfaces/Github";

export const githubProjects: Github[] = [
  {
    name: "shortener generator",
    repoUrl: "https://github.com/jbalibrea1/shortener",
    publicUrl: "https://sh.jbalibrea.dev",
    description:
      "✂️ This is a simple URL shortener service built with Next.js, shadcn, Node.js, Express, and MongoDB",

    tags: ["Next.js", "Node.js", "Express", "MongoDB", "shadcn"],
  },
  {
    name: "jbalibrea.dev - Portfolio",
    repoUrl: "https://github.com/jbalibrea1/jbalibrea.dev",
    description:
      "🚀 My personal portfolio built with Astro, TypeScript, React, and TailwindCSS",
    tags: ["TypeScript", "Astro", "Tailwind", "React", "Portfolio"],
  },
  {
    name: "IdealistaWatch",
    repoUrl: "https://github.com/borjamorenoMurciaeduca/proyecto-final-daw",
    publicUrl: "https://idealista-watch.es",
    description:
      "🏡 Web application to monitor price and properties of Idealista, add notes and shared with other users",
    tags: ["React", "Laravel", "MUI", "MySQL", "Clean architecture", "Python"],
  },
  {
    name: "dotfiles",
    repoUrl: "https://github.com/jbalibrea1/dotfiles",
    description: "✨ My personal dotfiles for Neovim, Tmux, i3 and more",
    tags: ["lua", "dotfiles", "neovim", "tmux"],
  },
  {
    name: "GO",
    repoUrl: "https://github.com/jbalibrea1/go",
    description: "Initials go examples",
    tags: ["Go"],
  },
  {
    name: "Full Stack Open - Deep Dive into Modern Web Development",
    repoUrl: "https://github.com/jbalibrea1/fullstackopen",
    description: "🧾My solutions to the Full Stack Open course",
    tags: ["React", "TypeScript", "MongoDB", "Node.js", "GraphQL", "Express"],
  },
];

export default githubProjects;
