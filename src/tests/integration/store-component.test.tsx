/**
 * Integration Tests for Store-Component Integration
 *
 * Tests integration between Zustand stores and React components.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useIslamicContentQualityStore } from '@/stores/islamicContentQualityStore'

// Mock component that uses the store
function TestComponent() {
  const { rules, addRule } = useIslamicContentQualityStore()

  const handleAddRule = () => {
    addRule({
      id: 'test-rule-1',
      name: 'Test Rule',
      category: 'text_authenticity',
      priority: 'high',
      description: 'Test Description',
      validation: {
        type: 'format_check',
        criteria: ['test'],
        automaticCheck: true
      },
      compliance: {
        required: true,
        islamicStandard: 'Test Standard',
        source: 'Test Source'
      },
      isActive: true
    })
  }

  return (
    <div>
      <div data-testid="rule-count">{rules.length}</div>
      <button onClick={handleAddRule}>Add Rule</button>
      {rules.map(rule => (
        <div key={rule.id} data-testid={`rule-${rule.id}`}>
          {rule.name}
        </div>
      ))}
    </div>
  )
}

describe('Store-Component Integration', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useIslamicContentQualityStore.getState()
    store.rules = []
  })

  it('should display initial store state', () => {
    render(<TestComponent />)

    const ruleCount = screen.getByTestId('rule-count')
    expect(ruleCount).toHaveTextContent('0')
  })

  it('should update component when store changes', async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    const addButton = screen.getByRole('button', { name: /add rule/i })
    await user.click(addButton)

    await waitFor(() => {
      const ruleCount = screen.getByTestId('rule-count')
      expect(ruleCount).toHaveTextContent('1')
    })

    const rule = screen.getByTestId('rule-test-rule-1')
    expect(rule).toHaveTextContent('Test Rule')
  })

  it('should persist store changes across component unmounts', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<TestComponent />)

    const addButton = screen.getByRole('button', { name: /add rule/i })
    await user.click(addButton)

    unmount()

    // Re-mount component
    render(<TestComponent />)

    await waitFor(() => {
      const ruleCount = screen.getByTestId('rule-count')
      expect(ruleCount).toHaveTextContent('1')
    })
  })

  it('should handle multiple component instances sharing store', async () => {
    const user = userEvent.setup()

    // Render two instances
    const { container: container1 } = render(<TestComponent />)
    const { container: container2 } = render(<TestComponent />)

    // Add rule from first instance
    const addButton1 = container1.querySelector('button')!
    await user.click(addButton1)

    // Both instances should reflect the change
    await waitFor(() => {
      const count1 = container1.querySelector('[data-testid="rule-count"]')
      const count2 = container2.querySelector('[data-testid="rule-count"]')

      expect(count1).toHaveTextContent('1')
      expect(count2).toHaveTextContent('1')
    })
  })
})
