import type { Github } from "../interfaces/Github";

export const githubProjects: Github[] = [
  {
    name: "jbalibrea.dev - Portfolio",
    url: "https://github.com/jbalibrea1/portfolio-jbalibrea",
    description:
      "🚀My personal portfolio built with Astro, TypeScript, React, and TailwindCSS",
    tags: ["TypeScript", "Astro", "Tailwind", "React", "Portfolio"],
  },
  {
    name: "IdealistaWatch",
    url: "https://github.com/borjamorenoMurciaeduca/proyecto-final-daw",
    description:
      "🏡Web application to monitor price and properties of Idealista, add notes and shared with other users",
    tags: ["React", "Laravel", "MUI", "MySQL", "Clean architecture", "Python"],
  },
  {
    name: "dotfiles",
    url: "https://github.com/jbalibrea1/dotfiles",
    description: "✨My personal dotfiles for Neovim, Tmux, i3 and more",
    tags: ["lua", "dotfiles", "neovim", "tmux"],
  },
  {
    name: "GO",
    url: "https://github.com/jbalibrea1/go",
    description: "Initials go examples",
    tags: ["Go"],
  },
  {
    name: "Full Stack Open - Deep Dive into Modern Web Development",
    url: "https://github.com/jbalibrea1/fullstackopen",
    description: "🧾My solutions to the Full Stack Open course",
    tags: ["React", "TypeScript", "MongoDB", "Node.js", "GraphQL", "Express"],
  },
];

export default githubProjects;
