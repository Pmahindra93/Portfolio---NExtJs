"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export type AgentState = "connecting" | "initializing" | "listening" | "speaking" | "thinking"

interface BarVisualizerProps {
  state: AgentState
  barCount?: number
  minHeight?: number
  maxHeight?: number
  className?: string
}

export function BarVisualizer({
  state,
  barCount = 20,
  minHeight = 15,
  maxHeight = 90,
  className,
}: BarVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const barsRef = useRef<number[]>(Array(barCount).fill(minHeight))
  const targetBarsRef = useRef<number[]>(Array(barCount).fill(minHeight))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const getStateColor = (state: AgentState): string => {
      switch (state) {
        case "connecting":
          return "#3b82f6" // blue
        case "initializing":
          return "#00ff00" // green (terminal color)
        case "listening":
          return "#22c55e" // green
        case "speaking":
          return "#00d9ff" // cyan
        case "thinking":
          return "#eab308" // yellow
        default:
          return "#00ff00"
      }
    }

    const getStateIntensity = (state: AgentState): number => {
      switch (state) {
        case "connecting":
          return 0.3
        case "initializing":
          return 0.4
        case "listening":
          return 0.7
        case "speaking":
          return 1.0
        case "thinking":
          return 0.5
        default:
          return 0.3
      }
    }

    const updateTargetBars = () => {
      const intensity = getStateIntensity(state)

      for (let i = 0; i < barCount; i++) {
        if (state === "connecting" || state === "initializing") {
          // Smooth wave pattern for connecting/initializing
          const wave = Math.sin(Date.now() * 0.003 + i * 0.5) * 0.5 + 0.5
          targetBarsRef.current[i] = minHeight + wave * (maxHeight - minHeight) * intensity
        } else if (state === "listening") {
          // Gentle pulsing for listening
          const pulse = Math.sin(Date.now() * 0.002) * 0.3 + 0.7
          const randomness = Math.random() * 0.3
          targetBarsRef.current[i] = minHeight + (pulse + randomness) * (maxHeight - minHeight) * intensity
        } else if (state === "speaking") {
          // Active random bars for speaking
          const random = Math.random()
          targetBarsRef.current[i] = minHeight + random * (maxHeight - minHeight) * intensity
        } else if (state === "thinking") {
          // Slow wave for thinking
          const wave = Math.sin(Date.now() * 0.001 + i * 0.3) * 0.5 + 0.5
          targetBarsRef.current[i] = minHeight + wave * (maxHeight - minHeight) * intensity
        }
      }
    }

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Recompute bar dimensions each frame to stay in sync after resize
      const barWidth = rect.width / barCount
      const barGap = barWidth * 0.2

      updateTargetBars()

      // Smooth interpolation
      for (let i = 0; i < barCount; i++) {
        const diff = targetBarsRef.current[i] - barsRef.current[i]
        barsRef.current[i] += diff * 0.1
      }

      const color = getStateColor(state)

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth
        const height = barsRef.current[i]
        const y = (rect.height - height) / 2

        // Draw bar with gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + height)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, color + "80") // Add transparency

        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth - barGap, height)

        // Add glow effect
        if (state === "speaking" || state === "listening") {
          ctx.shadowBlur = 10
          ctx.shadowColor = color
          ctx.fillRect(x, y, barWidth - barGap, height)
          ctx.shadowBlur = 0
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [state, barCount, minHeight, maxHeight])

  return (
    <div className={cn("relative w-full", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  )
}
