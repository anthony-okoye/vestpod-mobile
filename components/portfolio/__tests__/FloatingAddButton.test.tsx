/**
 * FloatingAddButton Component Tests
 * 
 * Tests for positioning and animation
 */

// Mock React Native components
jest.mock('react-native', () => ({
  TouchableOpacity: 'TouchableOpacity',
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
  Platform: {
    select: (obj: any) => obj.ios || obj.default,
    OS: 'ios',
  },
  Animated: {
    View: 'Animated.View',
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(),
    })),
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
import { FloatingAddButton } from '../FloatingAddButton';

describe('FloatingAddButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders correctly', () => {
    const { getByLabelText } = render(
      <FloatingAddButton onPress={mockOnPress} />
    );

    expect(getByLabelText('add')).toBeTruthy();
  });

  it('has correct accessibility properties', () => {
    const { getByLabelText } = render(
      <FloatingAddButton onPress={mockOnPress} />
    );

    const button = getByLabelText('add').parent;
    expect(button?.props.accessibilityLabel).toBe('Add new asset');
    expect(button?.props.accessibilityHint).toBe('Opens the add asset flow to add a new investment to your portfolio');
    expect(button?.props.accessibilityRole).toBe('button');
  });

  it('calls onPress when pressed', () => {
    const { getByLabelText } = render(
      <FloatingAddButton onPress={mockOnPress} />
    );

    const button = getByLabelText('add').parent;
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('applies custom style when provided', () => {
    const customStyle = { bottom: 120 };
    const { getByTestId } = render(
      <FloatingAddButton onPress={mockOnPress} style={customStyle} testID="fab-button" />
    );

    const container = getByTestId('fab-button').parent;
    expect(container?.props.style).toContainEqual(customStyle);
  });

  it('applies custom testID when provided', () => {
    const { getByTestId } = render(
      <FloatingAddButton onPress={mockOnPress} testID="custom-fab" />
    );

    expect(getByTestId('custom-fab')).toBeTruthy();
  });

  it('is positioned absolutely', () => {
    const { getByLabelText } = render(
      <FloatingAddButton onPress={mockOnPress} />
    );

    const container = getByLabelText('add').parent?.parent;
    const styles = container?.props.style;
    
    expect(styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          position: 'absolute',
          right: 16,
          bottom: 96,
        })
      ])
    );
  });

  it('has correct size', () => {
    const { getByLabelText } = render(
      <FloatingAddButton onPress={mockOnPress} />
    );

    const button = getByLabelText('add').parent;
    const styles = button?.props.style;
    
    expect(styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 56,
          height: 56,
        })
      ])
    );
  });

  it('displays add icon with correct size', () => {
    const { getByLabelText } = render(
      <FloatingAddButton onPress={mockOnPress} />
    );

    const icon = getByLabelText('add');
    expect(icon.props.size).toBe(24);
  });
});
