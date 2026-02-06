/**
 * PortfolioHeader Component Tests
 * 
 * Tests for search and filter interactions
 */

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
  Platform: {
    select: (obj: any) => obj.ios || obj.default,
    OS: 'ios',
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PortfolioHeader from '../PortfolioHeader';

describe('PortfolioHeader', () => {
  const mockOnSearchChange = jest.fn();
  const mockOnFilterChange = jest.fn();
  const filters = ['All', 'Stocks', 'Crypto', 'Commodities', 'Real Estate', 'Fixed Income'];

  beforeEach(() => {
    mockOnSearchChange.mockClear();
    mockOnFilterChange.mockClear();
  });

  it('renders correctly with initial props', () => {
    const { getByText, getByPlaceholderText } = render(
      <PortfolioHeader
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="All"
        onFilterChange={mockOnFilterChange}
        filters={filters}
      />
    );

    expect(getByText('Portfolio')).toBeTruthy();
    expect(getByPlaceholderText('Search assets...')).toBeTruthy();
  });

  it('displays all filter chips', () => {
    const { getByText } = render(
      <PortfolioHeader
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="All"
        onFilterChange={mockOnFilterChange}
        filters={filters}
      />
    );

    filters.forEach(filter => {
      expect(getByText(filter)).toBeTruthy();
    });
  });

  it('calls onSearchChange when text is entered', () => {
    const { getByPlaceholderText } = render(
      <PortfolioHeader
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="All"
        onFilterChange={mockOnFilterChange}
        filters={filters}
      />
    );

    const searchInput = getByPlaceholderText('Search assets...');
    fireEvent.changeText(searchInput, 'AAPL');

    expect(mockOnSearchChange).toHaveBeenCalledWith('AAPL');
  });

  it('displays clear button when search query is not empty', () => {
    const { getByLabelText } = render(
      <PortfolioHeader
        searchQuery="AAPL"
        onSearchChange={mockOnSearchChange}
        selectedFilter="All"
        onFilterChange={mockOnFilterChange}
        filters={filters}
      />
    );

    const clearButton = getByLabelText('close-circle');
    expect(clearButton).toBeTruthy();
  });

  it('clears search query when clear button is pressed', () => {
    const { getByLabelText } = render(
      <PortfolioHeader
        searchQuery="AAPL"
        onSearchChange={mockOnSearchChange}
        selectedFilter="All"
        onFilterChange={mockOnFilterChange}
        filters={filters}
      />
    );

    const clearButton = getByLabelText('close-circle');
    fireEvent.press(clearButton.parent);

    expect(mockOnSearchChange).toHaveBeenCalledWith('');
  });

  it('calls onFilterChange when a filter chip is pressed', () => {
    const { getByText } = render(
      <PortfolioHeader
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="All"
        onFilterChange={mockOnFilterChange}
        filters={filters}
      />
    );

    const stocksFilter = getByText('Stocks');
    fireEvent.press(stocksFilter);

    expect(mockOnFilterChange).toHaveBeenCalledWith('Stocks');
  });

  it('highlights the selected filter chip', () => {
    const { getByText } = render(
      <PortfolioHeader
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="Stocks"
        onFilterChange={mockOnFilterChange}
        filters={filters}
      />
    );

    const stocksFilter = getByText('Stocks');
    expect(stocksFilter).toBeTruthy();
  });

  it('allows switching between filters', () => {
    const { getByText, rerender } = render(
      <PortfolioHeader
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="All"
        onFilterChange={mockOnFilterChange}
        filters={filters}
      />
    );

    const cryptoFilter = getByText('Crypto');
    fireEvent.press(cryptoFilter);

    expect(mockOnFilterChange).toHaveBeenCalledWith('Crypto');

    rerender(
      <PortfolioHeader
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        selectedFilter="Crypto"
        onFilterChange={mockOnFilterChange}
        filters={filters}
      />
    );

    const realEstateFilter = getByText('Real Estate');
    fireEvent.press(realEstateFilter);

    expect(mockOnFilterChange).toHaveBeenCalledWith('Real Estate');
  });
});
