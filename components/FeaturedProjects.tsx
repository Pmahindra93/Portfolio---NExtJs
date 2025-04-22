'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { ExternalLink } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  gifUrl: string
  projectUrl: string
  technologies: string[]
}

const projects: Project[] = [
  {
    id: 'ai-chat',
    title: 'AI Chat Application',
    description: 'A real-time chat application powered by large language models. Built with Next.js, TypeScript, and integrated with OpenAI\'s GPT-4 API. Features include conversation memory, code highlighting, and markdown support.',
    gifUrl: '/images/projects/ai-chat.gif',
    projectUrl: 'https://github.com/yourusername/ai-chat',
    technologies: ['Next.js', 'TypeScript', 'OpenAI', 'TailwindCSS']
  },
  {
    id: 'ml-dashboard',
    title: 'ML Analytics Dashboard',
    description: 'An interactive dashboard for visualizing machine learning model performance metrics. Built with React and D3.js, featuring real-time data updates and customizable visualizations.',
    gifUrl: '/images/projects/ml-dashboard.gif',
    projectUrl: 'https://github.com/yourusername/ml-dashboard',
    technologies: ['React', 'D3.js', 'Python', 'FastAPI']
  },
  {
    id: 'llm-api',
    title: 'LLM API Service',
    description: 'A scalable API service for deploying and managing multiple language models. Includes features like model versioning, A/B testing, and performance monitoring.',
    gifUrl: '/images/projects/llm-api.gif',
    projectUrl: 'https://github.com/yourusername/llm-api',
    technologies: ['Python', 'FastAPI', 'Docker', 'PostgreSQL']
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
            className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => setSelectedProject(project)}
          >
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
              <h3 className="text-white text-lg font-semibold">{project.title}</h3>
            </div>
            <Image
              src={project.gifUrl}
              alt={project.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        {selectedProject && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{selectedProject.title}</DialogTitle>
            </DialogHeader>
            <div className="relative h-[300px] my-4">
              <Image
                src={selectedProject.gifUrl}
                alt={selectedProject.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <DialogDescription className="space-y-4">
              <div className="text-slate-600 dark:text-slate-400">
                {selectedProject.description}
              </div>
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
                  <Link href={selectedProject.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    View Project <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </DialogDescription>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
