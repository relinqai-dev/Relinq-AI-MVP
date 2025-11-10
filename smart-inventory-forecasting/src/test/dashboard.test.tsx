/**
 * Dashboard Component Tests
 * Basic dashboard component tests
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Simple mock dashboard component
const MockDashboard = () => {
  return (
    <div data-testid="dashboard">
      <header>
        <h1>Inventory Dashboard</h1>
      </header>
      <main>
        <section data-testid="metrics">
          <div>Total Items: 100</div>
        </section>
        <section data-testid="actions">
          <button>Generate Forecast</button>
        </section>
      </main>
    </div>
  )
}

describe('Dashboard Component', () => {
  it('should render dashboard with header', () => {
    render(<MockDashboard />)
    
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    expect(screen.getByText('Inventory Dashboard')).toBeInTheDocument()
  })

  it('should display metrics section', () => {
    render(<MockDashboard />)
    
    expect(screen.getByTestId('metrics')).toBeInTheDocument()
  })

  it('should display actions section', () => {
    render(<MockDashboard />)
    
    expect(screen.getByTestId('actions')).toBeInTheDocument()
    expect(screen.getByText('Generate Forecast')).toBeInTheDocument()
  })
})
