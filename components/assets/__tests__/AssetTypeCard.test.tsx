/**
 * AssetTypeCard Component Tests
 * 
 * Tests for the AssetTypeCard component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AssetTypeCard } from '../AssetTypeCard';

describe('AssetTypeCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders correctly with stocks type', () => {
    const { getByText, getByLabelText } = render(
      <AssetTypeCard assetType="stocks" onPress={mockOnPress} />
    );

    expect(getByText('Stocks')).toBeTruthy();
    expect(getByLabelText('Stocks asset type')).toBeTruthy();
  });

  it('renders correctly with crypto type', () => {
    const { getByText, getByLabelText } = render(
      <AssetTypeCard assetType="crypto" onPress={mockOnPress} />
    );

    expect(getByText('Crypto')).toBeTruthy();
    expect(getByLabelText('Crypto asset type')).toBeTruthy();
  });

  it('renders correctly with commodities type', () => {
    const { getByText } = render(
      <AssetTypeCard assetType="commodities" onPress={mockOnPress} />
    );

    expect(getByText('Commodities')).toBeTruthy();
  });

  it('renders correctly with real_estate type', () => {
    const { getByText } = render(
      <AssetTypeCard assetType="real_estate" onPress={mockOnPress} />
    );

    expect(getByText('Real Estate')).toBeTruthy();
  });

  it('renders correctly with fixed_income type', () => {
    const { getByText } = render(
      <AssetTypeCard assetType="fixed_income" onPress={mockOnPress} />
    );

    expect(getByText('Fixed Income')).toBeTruthy();
  });

  it('calls onPress with correct asset type when pressed', () => {
    const { getByLabelText } = render(
      <AssetTypeCard assetType="stocks" onPress={mockOnPress} />
    );

    const card = getByLabelText('Stocks asset type');
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(mockOnPress).toHaveBeenCalledWith('stocks');
  });

  it('has correct accessibility properties', () => {
    const { getByLabelText } = render(
      <AssetTypeCard assetType="crypto" onPress={mockOnPress} />
    );

    const card = getByLabelText('Crypto asset type');
    expect(card.props.accessibilityRole).toBe('button');
    expect(card.props.accessibilityHint).toBe('Select Crypto to add this type of asset');
  });

  it('applies custom style when provided', () => {
    const customStyle = { marginTop: 20 };
    const { getByLabelText } = render(
      <AssetTypeCard assetType="stocks" onPress={mockOnPress} style={customStyle} />
    );

    const card = getByLabelText('Stocks asset type');
    expect(card.parent?.props.style).toContainEqual(customStyle);
  });

  it('applies custom testID when provided', () => {
    const { getByTestId } = render(
      <AssetTypeCard assetType="stocks" onPress={mockOnPress} testID="custom-test-id" />
    );

    expect(getByTestId('custom-test-id')).toBeTruthy();
  });
});
