import { Moon, Sun } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { useTheme } from "@/lib/hooks/useTheme"

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme()

  return (
    <Toggle
      aria-label="Toggle dark mode"
      className="fixed bottom-4 right-4 z-50"
      pressed={isDarkMode}
      onPressedChange={toggleDarkMode}
    >
      {isDarkMode ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Toggle>
  )
}
