import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { githubProjects } from "../data/githubProjects";
import type { Github } from "../interfaces/Github";

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
      key={repo.url}
      onMouseMove={(e) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();

        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
      }}
      className="group relative rounded-xl bg-neutral-50 border-neutral-300 dark:bg-neutral-900 border dark:border-zinc-800 "
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
      <div className="space-y-6 sm:space-y-4 py-4 px-6">
        <h3 className=" dark:text-slate-200 font-bold tracking-tight transition duration-75 hover:text-blue-700 dark:hover:text-white">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group-a inline-flex items-center max-w-fit justify-start transition ease-in-out hover:scale-105 hover:underline decoration-dotted opacity-80 hover:opacity-100 "
          >
            {repo.name}
            <svg
              className="w-3 h-3 ms-2 mb-2 transition ease-in-out  -rotate-45 group-a-hover:scale-x-110 "
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              ></path>
            </svg>
          </a>
        </h3>
        <p className="text-sm dark:text-slate-200">
          {repo.description ? repo.description : "Description empty"}
        </p>
        <div className="flex gap-2 flex-wrap">
          {repo.tags.map((tag) => (
            <div
              className="relative inline-flex overflow-hidden rounded-full p-px"
              key={tag}
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#c2c2c2_0%,#505050_50%,#bebebe_100%)] bg-[conic-gradient(from_90deg_at_50%_50%,#c2c2c2_0%,#505050_50%,#bebebe_100%)]" />
              <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-slate-50 dark:bg-neutral-950 px-3 py-1 text-xs font-medium dark:text-gray-50 text-gray-900 backdrop-blur-3xl select-all">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  ));
}
