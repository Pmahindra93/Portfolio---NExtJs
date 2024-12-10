import Image from 'next/image'
import { Card } from './ui/card'

interface TimelineEvent {
  year: string
  title: string
  description: string
  image?: string
}

const timelineEvents: TimelineEvent[] = [
  {
    year: '2024',
    title: 'Present Role',
    description: 'Current position and achievements'
  },
  {
    year: '2022',
    title: 'Career Milestone',
    description: 'Significant achievement or role'
  },
  // Add more events as needed
]

export function Timeline() {
  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
      {timelineEvents.map((event, index) => (
        <div key={event.year} className="relative flex items-center">
          <div className="absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-slate-900 shadow">
            {event.year}
          </div>
          
          <Card className="ml-14 w-full">
            <div className="flex flex-col md:flex-row gap-4 p-4">
              {event.image ? (
                <div className="relative w-full md:w-48 h-48">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              ) : (
                <div className="relative w-full md:w-48 h-48 bg-slate-200 rounded-md" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {event.description}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}
