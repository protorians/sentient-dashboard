import '@testing-library/jest-dom'

// Mock next/link to render children directly in tests
import * as NextLink from 'next/link'

// @ts-ignore
NextLink.default = ({ children }: any) => children
