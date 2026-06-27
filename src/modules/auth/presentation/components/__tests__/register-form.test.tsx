/// <reference types="vitest" />
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { RegisterForm } from '../register-form'

describe('RegisterForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form with all required fields', () => {
    render(<RegisterForm />)
    expect(screen.getByPlaceholderText(/Ex: John/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Ex: Doe/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email@example.com/i)).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText(/••••••••/i)).toHaveLength(2)
  })

  it('renders submit button', () => {
    render(<RegisterForm />)
    expect(screen.getByRole('button', { name: /Créer un compte/i })).toBeInTheDocument()
  })
})
