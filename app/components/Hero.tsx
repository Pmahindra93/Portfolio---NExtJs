"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { ChatButton } from "./chat/chat-button";


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
    <section className="relative py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32 overflow-hidden">
      <div className="container px-3 sm:px-4 md:px-6 relative z-10">
        <div className="grid gap-6 sm:gap-8 md:gap-10 lg:gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* PrateekGPT Button */}
            <div>
              <ChatButton />
            </div>

            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter uppercase font-mono leading-[0.9]">
                Prateek <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                  Mahindra
                </span>
              </h1>
              <div className="min-h-[40px] sm:min-h-[60px]">
                <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-mono text-slate-600 dark:text-slate-400">
                  <span className="mr-2 text-green-600 dark:text-green-400">
                    &gt;
                  </span>
                  {text}
                  <span className="animate-pulse">_</span>
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Product engineer and AI builder sharing playbooks on shipping
              LLM-powered products, startup growth, and applied experimentation.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              <Link
                href="#projects"
                className="group relative inline-flex h-9 sm:h-10 md:h-11 lg:h-12 items-center justify-center overflow-hidden rounded-sm bg-slate-900 px-3 sm:px-4 md:px-6 lg:px-8 font-mono font-medium text-xs sm:text-sm md:text-base text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 border-2 border-transparent hover:border-slate-900 dark:hover:border-white w-full sm:w-auto"
              >
                <span className="mr-1.5 sm:mr-2">View Projects</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#contact"
                className="group inline-flex h-9 sm:h-10 md:h-11 lg:h-12 items-center justify-center rounded-sm border-2 border-slate-900 bg-transparent px-3 sm:px-4 md:px-6 lg:px-8 font-mono font-medium text-xs sm:text-sm md:text-base text-slate-900 transition-all hover:bg-slate-100 dark:border-white dark:text-white dark:hover:bg-slate-800 w-full sm:w-auto"
              >
                <Mail className="mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                <span>Contact Protocol</span>
              </Link>
            </div>
          </div>

          {/* Hide entire image section on mobile */}
          <div className="hidden sm:block relative mx-auto w-full max-w-[280px] md:max-w-[340px] lg:max-w-none">
            <div className="relative aspect-square md:aspect-[4/5] w-full border-2 md:border-4 border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800 p-2 sm:p-3 md:p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] dark:md:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] dark:lg:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <div className="relative h-full w-full overflow-hidden grayscale contrast-125">
                <Image
                  src="/images/career-2024.JPG"
                  alt="Prateek Mahindra"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none"></div>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute -top-1.5 sm:-top-2 -left-1.5 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 bg-white border-2 border-slate-900 dark:bg-slate-900 dark:border-white"></div>
              <div className="absolute -top-1.5 sm:-top-2 -right-1.5 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-white border-2 border-slate-900 dark:bg-slate-900 dark:border-white"></div>
              <div className="absolute -bottom-1.5 sm:-bottom-2 -left-1.5 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 bg-white border-2 border-slate-900 dark:bg-slate-900 dark:border-white"></div>
              <div className="absolute -bottom-1.5 sm:-bottom-2 -right-1.5 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-white border-2 border-slate-900 dark:bg-slate-900 dark:border-white"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
