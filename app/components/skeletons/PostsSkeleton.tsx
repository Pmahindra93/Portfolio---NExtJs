'use client'

import { useTheme } from '@/lib/hooks/useTheme'

export function PostsSkeleton() {
  const { is90sStyle } = useTheme()

  if (is90sStyle) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-[#FFFFFF] border-4 border-[#000000] animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-[#C0C0C0] border-2 border-[#000000] flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-5 w-3/4 bg-[#C0C0C0] mb-3 border border-[#808080]"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-[#C0C0C0] border border-[#808080]"></div>
                  <div className="h-4 w-5/6 bg-[#C0C0C0] border border-[#808080]"></div>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <div className="h-4 w-24 bg-[#C0C0C0] border border-[#808080]"></div>
                  <div className="h-4 w-16 bg-[#C0C0C0] border border-[#808080]"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 rounded-lg shadow-sm animate-pulse bg-white dark:bg-slate-800">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-md flex-shrink-0 bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex-1">
              <div className="h-5 rounded w-3/4 mb-3 bg-slate-200 dark:bg-slate-700"></div>
              <div className="space-y-2">
                <div className="h-4 rounded w-full bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-4 rounded w-5/6 bg-slate-200 dark:bg-slate-700"></div>
              </div>
              <div className="mt-3 flex items-center space-x-2">
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
