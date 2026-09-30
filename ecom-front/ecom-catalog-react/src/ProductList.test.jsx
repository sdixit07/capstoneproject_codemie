import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductList from './ProductList'

const products = [
  { id: 1, name: 'Smart phone', description: 'Latest model', imageUrl: 'https://placehold.co/600x400', price: 599.99, category: { id: 1, name: 'Electronics' } },
  { id: 2, name: 'Winter jacket', description: 'Warm jacket', imageUrl: 'https://placehold.co/600x400', price: 99.99, category: { id: 2, name: 'Clothing' } },
]

describe('ProductList', () => {
  it('renders a clickable card linking to the product detail page for each product', () => {
    render(
      <MemoryRouter>
        <ProductList products={products} />
      </MemoryRouter>
    )

    const smartPhoneLink = screen.getByRole('link', { name: /smart phone/i })
    expect(smartPhoneLink).toHaveAttribute('href', '/products/1')

    const jacketLink = screen.getByRole('link', { name: /winter jacket/i })
    expect(jacketLink).toHaveAttribute('href', '/products/2')
  })
})
