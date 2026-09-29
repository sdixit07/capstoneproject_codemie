import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProductDetail from './ProductDetail'

const renderWithRoute = (id) =>
  render(
    <MemoryRouter initialEntries={[`/products/${id}`]}>
      <Routes>
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>
  )

describe('ProductDetail', () => {
  const origFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = origFetch
  })

  it('shows a loading state before the fetch resolves', () => {
    globalThis.fetch.mockReturnValue(new Promise(() => {}))
    renderWithRoute(1)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders product details on a successful fetch', async () => {
    const product = {
      id: 1,
      name: 'Smart phone',
      description: 'Latest model',
      imageUrl: 'https://placehold.co/600x400',
      price: 599.99,
      category: { id: 1, name: 'Electronics' },
    }
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => product,
    })

    renderWithRoute(1)

    await waitFor(() => expect(screen.getByText('Smart phone')).toBeInTheDocument())
    expect(screen.getByText('Latest model')).toBeInTheDocument()
    expect(screen.getByText(/599.99/)).toBeInTheDocument()
    expect(screen.getByText(/Electronics/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to catalog/i })).toHaveAttribute('href', '/')
  })

  it('shows a not-found state when the API returns 404', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    })

    renderWithRoute(999)

    await waitFor(() => expect(screen.getByText(/product not found/i)).toBeInTheDocument())
  })

  it('shows a generic error state on other failures', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    })

    renderWithRoute('abc')

    await waitFor(() => expect(screen.getByText(/unable to load product/i)).toBeInTheDocument())
  })
})
