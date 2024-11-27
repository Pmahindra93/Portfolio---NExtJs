import React from 'react'
import { render, screen } from '../utils/test-utils'
import { Sidebar } from '@/components/sidebar'

describe('Sidebar', () => {
  it('renders navigation items', () => {
    render(<Sidebar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  it('renders in modern style by default', () => {
    render(<Sidebar />)
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.queryByText('Cyber Navigation')).not.toBeInTheDocument()
  })

  it('renders construction gif only in 90s style', () => {
    const { container } = render(<Sidebar />)
    expect(container.querySelector('img[alt="Under Construction"]')).not.toBeInTheDocument()
  })
})
