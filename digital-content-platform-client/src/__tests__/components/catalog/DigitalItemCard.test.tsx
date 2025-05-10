// src/__tests__/components/catalog/DigitalItemCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DigitalItemCard from '../../../components/catalog/DigitalItemCard';

// Мокаем useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('DigitalItemCard Component', () => {
  const mockItem = {
    id: '123',
    title: 'Test Item',
    description: 'This is a test description that is long enough to be truncated in the card view.',
    price: 9.99,
    thumbnailUrl: 'test-thumbnail.jpg',
    categoryId: 'cat-1',
    categoryName: 'Test Category',
    userId: 'user-1',
    creatorUsername: 'testuser',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    status: 'Active'
  };

  const mockAddToCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders card with correct item details', () => {
    render(
      <BrowserRouter>
        <DigitalItemCard item={mockItem} onAddToCart={mockAddToCart} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText(/This is a test description/)).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('By: testuser')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'test-thumbnail.jpg');
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test Item');
  });

  test('navigates to item details when View Details button is clicked', () => {
    render(
      <BrowserRouter>
        <DigitalItemCard item={mockItem} onAddToCart={mockAddToCart} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('View Details'));
    expect(mockNavigate).toHaveBeenCalledWith('/items/123');
  });

  test('calls onAddToCart when Add to Cart button is clicked', () => {
    render(
      <BrowserRouter>
        <DigitalItemCard item={mockItem} onAddToCart={mockAddToCart} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith('123');
  });

  test('does not render Add to Cart button when onAddToCart is not provided', () => {
    render(
      <BrowserRouter>
        <DigitalItemCard item={mockItem} />
      </BrowserRouter>
    );

    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  test('truncates long description', () => {
    const longDescription = 'A'.repeat(200);
    const itemWithLongDesc = { ...mockItem, description: longDescription };

    render(
      <BrowserRouter>
        <DigitalItemCard item={itemWithLongDesc} />
      </BrowserRouter>
    );

    const displayedDesc = screen.getByText(/A+\.\.\./);
    expect(displayedDesc.textContent?.length).toBeLessThan(longDescription.length);
  });
});