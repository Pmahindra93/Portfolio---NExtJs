"use client";

import { motion } from "framer-motion";
import { Terminal, Cpu, Database, Globe, Layers, Command, Hash, Zap } from "lucide-react";

const technologies = [
  { name: "Next.js", icon: Globe },
  { name: "React", icon: Cpu },
  { name: "TypeScript", icon: Hash },
  { name: "Supabase", icon: Database },
  { name: "Node.js", icon: Layers },
  { name: "OpenAI", icon: Zap },
  { name: "TailwindCSS", icon: Command },
  { name: "Python", icon: Terminal },
];

export function TechStack() {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900 border-y-2 border-slate-900 dark:border-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Terminal Window */}
          <div className="bg-slate-900 dark:bg-black border-2 border-slate-900 dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-200 dark:bg-slate-800 border-b-2 border-slate-900 dark:border-white">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 border border-slate-900"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 border border-slate-900"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 border border-slate-900"></div>
              </div>
              <div className="font-mono text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                tech_stack.exe
              </div>
              <div className="w-12"></div> {/* Spacer for centering */}
            </div>

            {/* Terminal Body */}
            <div className="p-8 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-slate-900 dark:from-black to-transparent z-10"></div>
              <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-slate-900 dark:from-black to-transparent z-10"></div>

              <div className="flex items-center gap-12 overflow-hidden">
                <motion.div
                  className="flex gap-12 shrink-0"
                  animate={{
                    x: ["0%", "-50%"],
                  }}
                  transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 20,
                  }}
                >
                  {[...technologies, ...technologies].map((tech, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-3 group min-w-[100px]"
                    >
                      <div className="p-4 bg-slate-800 dark:bg-slate-900 border border-slate-700 hover:border-green-500 transition-colors">
                        <tech.icon className="w-8 h-8 text-slate-300 group-hover:text-green-500 transition-colors" />
                      </div>
                      <span className="font-mono text-xs text-slate-400 group-hover:text-green-500 uppercase tracking-widest">
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>

              <div className="mt-8 font-mono text-sm text-green-500">
                <span className="mr-2">$</span>
                <span className="typing-text">installing dependencies... done</span>
                <span className="animate-pulse">_</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
