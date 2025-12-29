"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Terminal, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Hero() {
  const [text, setText] = useState("");
  const fullText = "Building intelligent apps for the future.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                System Online
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter uppercase font-mono leading-[0.9]">
                Prateek <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                  Mahindra
                </span>
              </h1>
              <div className="min-h-[60px]">
                <p className="text-xl md:text-2xl font-mono text-slate-600 dark:text-slate-400">
                  <span className="mr-2 text-green-600 dark:text-green-400">
                    &gt;
                  </span>
                  {text}
                  <span className="animate-pulse">_</span>
                </p>
              </div>
            </div>

            <p className="max-w-[600px] text-zinc-600 dark:text-zinc-400 md:text-lg leading-relaxed">
              Product engineer and AI builder sharing playbooks on shipping
              LLM-powered products, startup growth, and applied experimentation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#projects"
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-sm bg-slate-900 px-8 font-mono font-medium text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 border-2 border-transparent hover:border-slate-900 dark:hover:border-white w-full sm:w-auto"
              >
                <span className="mr-2">View Projects</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#contact"
                className="group inline-flex h-12 items-center justify-center rounded-sm border-2 border-slate-900 bg-transparent px-8 font-mono font-medium text-slate-900 transition-all hover:bg-slate-100 dark:border-white dark:text-white dark:hover:bg-slate-800 w-full sm:w-auto"
              >
                <Mail className="mr-2 w-4 h-4" />
                <span>Contact Protocol</span>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
            <div className="relative aspect-square md:aspect-[4/5] w-full border-4 border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <div className="relative h-full w-full overflow-hidden grayscale contrast-125">
                <Image
                  src="/images/career-2024.JPG"
                  alt="Prateek Mahindra"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none"></div>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-slate-900 dark:bg-slate-900 dark:border-white"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-slate-900 dark:bg-slate-900 dark:border-white"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-slate-900 dark:bg-slate-900 dark:border-white"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-slate-900 dark:bg-slate-900 dark:border-white"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
