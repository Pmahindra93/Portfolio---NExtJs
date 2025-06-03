'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  preview?: string // Optional path to GIF or image
  link?: string
}

const projects: Project[] = [
  {
    id: 'ai-chat',
    title: 'AI Chat Application',
    description: `A real-time chat application powered by Open Ai 4.1 models to answer any questions about Prateek\'s professional background.
    Built with Vite, TypeScript, and integrated with OpenAI\'s GPT-4.1 API.
    Features include conversation memory,rate limiting, and contextual memory to talk about Prateek\'s journey.`,
    technologies: ['Vite', 'TypeScript', 'OpenAI', 'TailwindCSS'],
    preview: '/images/ai-chat-preview.gif',
    link: 'https://solve-smart-landing-page.vercel.app/'
  },
  {
    id: 'ai-note-taking-app',
    title: 'AIVA - AI Note Taking App for Doctors',
    description: 'AI-powered medical scribing that allows doctors to record patient consultations in 99+ languages and generate summaries.',
    technologies: ['React', 'NextJS', 'Anthropic API', 'ElevenLabs API', 'Supabase Postgres'],
    preview: '/images/aiva-preview.gif',
    link: 'https://anaiva.io'
  },
  {
    id: 'llm-api',
    title: 'Bank Statement Analyzer',
    description: 'A scalable service for analyzing bank statements and extracting relevant information.',
    technologies: ['Typescript', 'NextJS', 'Anthropic API'],
    preview: '/images/bank-statement.gif',
    link: 'https://github.com/Pmahindra93/pdf-extractor'
  }
]

export function FeaturedProjects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="relative h-48 rounded-lg overflow-hidden cursor-pointer group bg-slate-100 dark:bg-slate-800"
            onClick={() => setSelectedProject(project)}
          >
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
              <h3 className="text-white text-lg font-semibold">{project.title}</h3>
            </div>
            <div className="flex items-center justify-center h-full">
              {project.preview ? (
                <Image
                  src={project.preview}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-slate-400 dark:text-slate-500">Project Preview</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        {selectedProject && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedProject.title}</DialogTitle>
              <DialogDescription>
                {selectedProject.description}
              </DialogDescription>
            </DialogHeader>
            <div className="h-[300px] my-4 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center relative">
              {selectedProject.preview ? (
                <Image
                  src={selectedProject.preview}
                  alt={selectedProject.title}
                  fill
                  className="object-contain"
                />
              ) : (
                <span className="text-slate-400 dark:text-slate-500">Project Preview</span>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedProject.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="pt-4">
                <Button asChild>
                  <Link href={selectedProject.link || ''} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    View Project <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
