/**
 * AssetCard Component Tests
 * 
 * Tests for rendering and press handlers
 */

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
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

jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AssetCard from '../AssetCard';

describe('AssetCard', () => {
  const mockOnPress = jest.fn();

  const mockAsset = {
    id: '1',
    name: 'Apple Inc.',
    ticker: 'AAPL',
    logo: '🍎',
    quantity: 10,
    totalValue: 1500.50,
    changePercent: 2.5,
    sparklineData: [100, 105, 103, 108, 110],
  };

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders asset information correctly', () => {
    const { getByText } = render(
      <AssetCard asset={mockAsset} onPress={mockOnPress} />
    );

    expect(getByText('Apple Inc.')).toBeTruthy();
    expect(getByText('AAPL • 10 units')).toBeTruthy();
    expect(getByText('$1,500.50')).toBeTruthy();
    expect(getByText('+2.50%')).toBeTruthy();
  });

  it('displays logo emoji when provided', () => {
    const { getByText } = render(
      <AssetCard asset={mockAsset} onPress={mockOnPress} />
    );

    expect(getByText('🍎')).toBeTruthy();
  });

  it('displays default icon when logo is not provided', () => {
    const assetWithoutLogo = { ...mockAsset, logo: undefined };
    const { getByLabelText } = render(
      <AssetCard asset={assetWithoutLogo} onPress={mockOnPress} />
    );

    expect(getByLabelText('briefcase')).toBeTruthy();
  });

  it('calls onPress with asset id when pressed', () => {
    const { getByText } = render(
      <AssetCard asset={mockAsset} onPress={mockOnPress} />
    );

    const card = getByText('Apple Inc.').parent?.parent?.parent?.parent;
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledWith('1');
  });

  it('displays positive change with green color and up arrow', () => {
    const { getByText, getByLabelText } = render(
      <AssetCard asset={mockAsset} onPress={mockOnPress} />
    );

    expect(getByText('+2.50%')).toBeTruthy();
    expect(getByLabelText('trending-up')).toBeTruthy();
  });

  it('displays negative change with red color and down arrow', () => {
    const negativeAsset = { ...mockAsset, changePercent: -3.2 };
    const { getByText, getByLabelText } = render(
      <AssetCard asset={negativeAsset} onPress={mockOnPress} />
    );

    expect(getByText('-3.20%')).toBeTruthy();
    expect(getByLabelText('trending-down')).toBeTruthy();
  });

  it('displays zero change with green color and up arrow', () => {
    const zeroChangeAsset = { ...mockAsset, changePercent: 0 };
    const { getByText, getByLabelText } = render(
      <AssetCard asset={zeroChangeAsset} onPress={mockOnPress} />
    );

    expect(getByText('+0.00%')).toBeTruthy();
    expect(getByLabelText('trending-up')).toBeTruthy();
  });

  it('formats currency values correctly', () => {
    const highValueAsset = { ...mockAsset, totalValue: 123456.78 };
    const { getByText } = render(
      <AssetCard asset={highValueAsset} onPress={mockOnPress} />
    );

    expect(getByText('$123,456.78')).toBeTruthy();
  });

  it('handles empty sparkline data', () => {
    const assetWithoutSparkline = { ...mockAsset, sparklineData: [] };
    const { getByText } = render(
      <AssetCard asset={assetWithoutSparkline} onPress={mockOnPress} />
    );

    expect(getByText('Apple Inc.')).toBeTruthy();
  });

  it('formats quantity with locale string', () => {
    const largeQuantityAsset = { ...mockAsset, quantity: 1000000 };
    const { getByText } = render(
      <AssetCard asset={largeQuantityAsset} onPress={mockOnPress} />
    );

    expect(getByText('AAPL • 1,000,000 units')).toBeTruthy();
  });
});
