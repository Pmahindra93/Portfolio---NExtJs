import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { ThemeProvider } from '@/lib/contexts/ThemeContext'

function render(ui: React.ReactElement, { ...renderOptions } = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

describe('test-utils', () => {
  it('renders with ThemeProvider wrapper', () => {
    const TestComponent = () => <div>Test</div>
    const { container } = render(<TestComponent />)
    expect(container).toBeInTheDocument()
  })
})

// re-export everything
export * from '@testing-library/react'
// override render method
export { render }
