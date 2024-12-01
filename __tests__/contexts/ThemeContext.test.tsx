import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/lib/contexts/ThemeContext'

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <div data-testid="theme-value">{theme}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear()
  })

  it('provides default theme value', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    expect(screen.getByTestId('theme-value')).toHaveTextContent('modern')
  })

  it('toggles theme when button is clicked', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Initial theme should be modern
    expect(screen.getByTestId('theme-value')).toHaveTextContent('modern')
    
    // Click the toggle button
    fireEvent.click(screen.getByText('Toggle Theme'))
    
    // Theme should now be 90s
    expect(screen.getByTestId('theme-value')).toHaveTextContent('90s')
  })

  it('persists theme in localStorage', () => {
    // Set initial theme in localStorage
    window.localStorage.setItem('theme', 'modern')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Initial theme should be modern from localStorage
    expect(screen.getByTestId('theme-value')).toHaveTextContent('modern')
    
    // Toggle theme
    fireEvent.click(screen.getByText('Toggle Theme'))
    
    // Theme should be updated in localStorage
    expect(window.localStorage.getItem('theme')).toBe('90s')
  })

  it('handles invalid localStorage value', () => {
    // Set invalid theme in localStorage
    window.localStorage.setItem('theme', 'invalid-theme')
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    // Should fall back to default theme (modern)
    expect(screen.getByTestId('theme-value')).toHaveTextContent('modern')
  })
})
