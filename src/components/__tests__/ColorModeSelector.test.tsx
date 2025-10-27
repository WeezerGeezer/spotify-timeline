import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColorModeSelector } from '../ColorModeSelector'

describe('ColorModeSelector', () => {
  it('renders all color mode options', () => {
    const mockOnChange = vi.fn()
    render(<ColorModeSelector currentMode="genre" onChange={mockOnChange} />)

    expect(screen.getByText('Genre')).toBeInTheDocument()
    expect(screen.getByText('Artist')).toBeInTheDocument()
    expect(screen.getByText('Album')).toBeInTheDocument()
    expect(screen.getByText('Release Year')).toBeInTheDocument()
  })

  it('highlights the current mode', () => {
    const mockOnChange = vi.fn()
    render(
      <ColorModeSelector currentMode="artist" onChange={mockOnChange} />
    )

    const artistButton = screen.getByText('Artist').closest('button')
    expect(artistButton).toHaveClass('bg-blue-50')
  })

  it('calls onChange when a mode is clicked', () => {
    const mockOnChange = vi.fn()
    render(<ColorModeSelector currentMode="genre" onChange={mockOnChange} />)

    const artistButton = screen.getByText('Artist')
    fireEvent.click(artistButton)

    expect(mockOnChange).toHaveBeenCalledWith('artist')
  })

  it('displays genre legend when genre mode is selected', () => {
    const mockOnChange = vi.fn()
    render(<ColorModeSelector currentMode="genre" onChange={mockOnChange} />)

    expect(screen.getByText('Legend')).toBeInTheDocument()
    expect(screen.getByText('Pop')).toBeInTheDocument()
  })
})
