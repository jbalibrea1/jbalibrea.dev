import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { githubProjects } from "../data/githubProjects";
import type { Github } from "../types/Github";

export function GitCard() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return githubProjects.map((repo: Github) => (
    <article
      onMouseMove={(e) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();

        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
      }}
      className="group relative  w-full overflow-hidden rounded-xl  bg-neutral-100 border-neutral-300 dark:bg-zinc-900 border dark:border-zinc-800 "
    >
      <div className="absolute right-5 top-0 h-px w-80 bg-gradient-to-l from-transparent via-white/30 via-10% to-transparent" />
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(200px circle at ${mouseX}px ${mouseY}px, ${isDarkMode ? "rgba(38, 38, 38, 0.4)" : "rgba(200,200,200,0.2)"}, transparent 80%)
          `,
        }}
      />
      <div className="space-y-2 p-4">
        <h2 className=" dark:text-slate-50 font-bold tracking-tight">
          <a
            href={repo.url}
            target="_blank"
            className="hover:underline decoration-dotted duration-300 transition-all"
          >
            {repo.name}
          </a>
        </h2>
        <p className="text-sm dark:text-slate-200">
          {repo.description ? repo.description : "Sin descripción"}
        </p>
        <div className="flex gap-2  flex-wrap ">
          {repo.tags.map((tag) => (
            <div
              className="relative inline-flex overflow-hidden rounded-full p-px  #505050"
              key={tag}
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#c2c2c2_0%,#505050_50%,#bebebe_100%)] bg-[conic-gradient(from_90deg_at_50%_50%,#c2c2c2_0%,#505050_50%,#bebebe_100%)]" />
              <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-slate-200 dark:bg-neutral-950 px-3 py-1 text-xs font-medium dark:text-gray-50 text-gray-900 backdrop-blur-3xl select-all">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  ));
}
