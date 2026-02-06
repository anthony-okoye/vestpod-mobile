/**
 * AddAssetForm Component Tests
 * 
 * Tests for validation and submission
 */

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
  Platform: {
    select: (obj: any) => obj.ios || obj.default,
    OS: 'ios',
  },
}));

jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: 'DateTimePicker',
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AddAssetForm } from '../AddAssetForm';

describe('AddAssetForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders all form fields', () => {
    const { getByText, getByPlaceholderText } = render(
      <AddAssetForm
        assetType="stocks"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('Ticker Symbol')).toBeTruthy();
    expect(getByText('Quantity')).toBeTruthy();
    expect(getByText('Purchase Price')).toBeTruthy();
    expect(getByText('Purchase Date')).toBeTruthy();
    expect(getByPlaceholderText('e.g., AAPL, BTC, TSLA')).toBeTruthy();
  });

  it('validates empty ticker field', async () => {
    const { getByText, getByLabelText } = render(
      <AddAssetForm
        assetType="stocks"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = getByText('Add Asset');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Ticker is required')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates empty quantity field', async () => {
    const { getByText, getByLabelText } = render(
      <AddAssetForm
        assetType="stocks"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tickerInput = getByLabelText('Ticker symbol');
    fireEvent.changeText(tickerInput, 'AAPL');

    const submitButton = getByText('Add Asset');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Quantity is required')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates negative quantity', async () => {
    const { getByText, getByLabelText } = render(
      <AddAssetForm
        assetType="stocks"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tickerInput = getByLabelText('Ticker symbol');
    const quantityInput = getByLabelText('Quantity');

    fireEvent.changeText(tickerInput, 'AAPL');
    fireEvent.changeText(quantityInput, '-5');

    const submitButton = getByText('Add Asset');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Quantity must be a positive number')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates empty purchase price field', async () => {
    const { getByText, getByLabelText } = render(
      <AddAssetForm
        assetType="stocks"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tickerInput = getByLabelText('Ticker symbol');
    const quantityInput = getByLabelText('Quantity');

    fireEvent.changeText(tickerInput, 'AAPL');
    fireEvent.changeText(quantityInput, '10');

    const submitButton = getByText('Add Asset');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Purchase price is required')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates negative purchase price', async () => {
    const { getByText, getByLabelText } = render(
      <AddAssetForm
        assetType="stocks"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tickerInput = getByLabelText('Ticker symbol');
    const quantityInput = getByLabelText('Quantity');
    const priceInput = getByLabelText('Purchase price');

    fireEvent.changeText(tickerInput, 'AAPL');
    fireEvent.changeText(quantityInput, '10');
    fireEvent.changeText(priceInput, '-150');

    const submitButton = getByText('Add Asset');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Price must be a positive number')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const { getByText, getByLabelText } = render(
      <AddAssetForm
        assetType="stocks"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tickerInput = getByLabelText('Ticker symbol');
    const quantityInput = getByLabelText('Quantity');
    const priceInput = getByLabelText('Purchase price');

    fireEvent.changeText(tickerInput, 'AAPL');
    fireEvent.changeText(quantityInput, '10');
    fireEvent.changeText(priceInput, '150.50');

    const submitButton = getByText('Add Asset');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        ticker: 'AAPL',
        quantity: 10,
        purchasePrice: 150.50,
        purchaseDate: expect.any(Date),
      });
    });
  });

  it('converts ticker to uppercase on submit', async () => {
    const { getByText, getByLabelText } = render(
      <AddAssetForm
        assetType="stocks"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tickerInput = getByLabelText('Ticker symbol');
    const quantityInput = getByLabelText('Quantity');
    const priceInput = getByLabelText('Purchase price');

    fireEvent.changeText(tickerInput, 'aapl');
    fireEvent.changeText(quantityInput, '10');
    fireEvent.changeText(priceInput, '150.50');

    const submitButton = getByText('Add Asset');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          ticker: 'AAPL',
        })
      );
    });
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByText } = render(
      <AddAssetForm
        assetType="stocks"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('clears error when user starts typing', async () => {
    const { getByText, getByLabelText, queryByText } = render(
      <AddAssetForm
        assetType="stocks"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = getByText('Add Asset');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Ticker is required')).toBeTruthy();
    });

    const tickerInput = getByLabelText('Ticker symbol');
    fireEvent.changeText(tickerInput, 'A');

    await waitFor(() => {
      expect(queryByText('Ticker is required')).toBeNull();
    });
  });

  it('handles decimal quantities', async () => {
    const { getByText, getByLabelText } = render(
      <AddAssetForm
        assetType="crypto"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tickerInput = getByLabelText('Ticker symbol');
    const quantityInput = getByLabelText('Quantity');
    const priceInput = getByLabelText('Purchase price');

    fireEvent.changeText(tickerInput, 'BTC');
    fireEvent.changeText(quantityInput, '0.5');
    fireEvent.changeText(priceInput, '50000');

    const submitButton = getByText('Add Asset');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 0.5,
        })
      );
    });
  });

  it('has correct accessibility properties', () => {
    const { getByLabelText } = render(
      <AddAssetForm
        assetType="stocks"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tickerInput = getByLabelText('Ticker symbol');
    expect(tickerInput.props.accessibilityHint).toBe('Enter the asset ticker symbol');

    const quantityInput = getByLabelText('Quantity');
    expect(quantityInput.props.accessibilityHint).toBe('Enter the quantity of assets');

    const priceInput = getByLabelText('Purchase price');
    expect(priceInput.props.accessibilityHint).toBe('Enter the purchase price per unit');
  });
});
