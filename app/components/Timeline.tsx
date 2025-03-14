'use client'

import Image from 'next/image'
import { Card } from './ui/card'

interface TimelineEvent {
  year: string
  title: string
  paragraphs: string[]
  image?: string
}

const timelineEvents: TimelineEvent[] = [
  {
    year: '2024',
    title: 'CEO - Chief Exploration Officer',
    paragraphs: [
      'Relocated from New York City to London, UK and spent this time developing my skill sets for an AI Engineer role.',
      'Focused on building expertise in machine learning frameworks and large language models.',
      'Contributed to several open-source projects and built personal applications using cutting-edge AI technologies.'
    ],
    image: '/images/career-2024.JPG'
  },
  {
    year: '2022',
    title: 'Educational Achievement',
    paragraphs: [
      'Earned a Master\'s in Computing, Entrepreneurship, and Innovation from NYU, a joint program between Stern School of Business and Courant Institute of Mathematical Sciences.',
      'Participated in NYU\'s Startup Bootcamp and Summer Startup Sprint, gaining hands-on experience in venture building.',
      'Served on the GSAB Advisory Board and mentored graduate students at GSAS, contributing to the NYU community.'
    ],
    image: '/images/education-2020.JPG'
  },
  {
    year: '2020',
    title: 'Emma Sleep – Head of Growth (UK & I)',
    paragraphs: [
      'Scaled UK & Ireland revenue from $25M to $100M through data-driven growth strategies.',
      'Led a team of four, managing performance marketing, customer acquisition, and retention.',
      'Improved conversion rates and customer lifetime value through CRO and personalized user journeys.'
    ],
    image: '/images/career-2020.jpg'
  },
  {
    year: '2019',
    title: 'Product Marketing Manager at Dyson',
    paragraphs: [
      'Led go-to-market strategy for new product launches such as Dyson 360 Robot, driving adoption and revenue growth in key markets.',
      'Developed and executed product marketing strategies, aligning global positioning with regional market insights.',
      'Collaborated cross-functionally with sales, engineering, and design teams to optimize sales.'
    ],
    image: '/images/milestone-2022.JPG'
  }
]

export function Timeline() {
  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
      {timelineEvents.map((event, index) => (
        <div key={event.year + index} className="relative flex items-center">
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
                <div className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  {event.paragraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}
