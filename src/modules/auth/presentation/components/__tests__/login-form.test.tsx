/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { SignInDataset } from '@/modules/auth/infrastructure/dataset/sign-in.dataset'
import { SignUpDataset } from '@/modules/auth/infrastructure/dataset/sign-up.dataset'

describe('Dataset Validation System', () => {
  describe('SignInDataset', () => {
    it('should validate required email field', () => {
      const { result } = renderHook(() => SignInDataset())
      const validation = result.current.validate()
      expect(validation.valid).toBe(false)
      expect(validation.errors.email).toBeDefined()
    })

    it('should validate email format', () => {
      const { result } = renderHook(() => SignInDataset())
      result.current.setter('email', 'invalid-email')
      const validation = result.current.validate()
      expect(validation.valid).toBe(false)
      expect(validation.errors.email).toContain('invalide')
    })

    it('should pass validation with valid data', () => {
      const { result } = renderHook(() => SignInDataset())
      result.current.setter('email', 'test@example.com')
      result.current.setter('password', 'password123')
      const validation = result.current.validate()
      expect(validation.valid).toBe(true)
      expect(validation.errors).toEqual({})
    })

    it('should validate password length', () => {
      const { result } = renderHook(() => SignInDataset())
      result.current.setter('email', 'test@example.com')
      result.current.setter('password', '123')
      const validation = result.current.validate()
      expect(validation.valid).toBe(false)
      expect(validation.errors.password).toContain('trop court')
    })
  })

  describe('SignUpDataset', () => {
    it('should validate all required fields', () => {
      const { result } = renderHook(() => SignUpDataset())
      const validation = result.current.validate()
      expect(validation.valid).toBe(false)
      expect(validation.errors.firstname).toBeDefined()
      expect(validation.errors.lastname).toBeDefined()
      expect(validation.errors.email).toBeDefined()
      expect(validation.errors.password).toBeDefined()
    })

    it('should pass validation with all valid data', () => {
      const { result } = renderHook(() => SignUpDataset())
      result.current.setter('firstname', 'John')
      result.current.setter('lastname', 'Doe')
      result.current.setter('email', 'john@example.com')
      result.current.setter('password', 'password123')
      result.current.setter('password_confirmation', 'password123')
      const validation = result.current.validate()
      expect(validation.valid).toBe(true)
    })
  })
})
