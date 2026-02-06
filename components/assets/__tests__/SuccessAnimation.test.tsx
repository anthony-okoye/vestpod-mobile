/**
 * SuccessAnimation Component Tests
 * 
 * Tests for animation and navigation
 */

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
  Animated: {
    View: 'Animated.View',
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(),
    })),
    timing: jest.fn(() => ({
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
import { render } from '@testing-library/react-native';
import { SuccessAnimation } from '../SuccessAnimation';

describe('SuccessAnimation', () => {
  it('renders with title and message', () => {
    const { getByText } = render(
      <SuccessAnimation
        title="Asset Added!"
        message="Your asset has been successfully added to your portfolio"
      />
    );

    expect(getByText('Asset Added!')).toBeTruthy();
    expect(getByText('Your asset has been successfully added to your portfolio')).toBeTruthy();
  });

  it('displays checkmark icon', () => {
    const { getByLabelText } = render(
      <SuccessAnimation
        title="Success"
        message="Operation completed"
      />
    );

    expect(getByLabelText('checkmark')).toBeTruthy();
  });

  it('applies custom testID when provided', () => {
    const { getByTestId } = render(
      <SuccessAnimation
        title="Success"
        message="Operation completed"
        testID="success-animation"
      />
    );

    expect(getByTestId('success-animation')).toBeTruthy();
  });

  it('renders with different titles', () => {
    const { getByText, rerender } = render(
      <SuccessAnimation
        title="First Title"
        message="First message"
      />
    );

    expect(getByText('First Title')).toBeTruthy();

    rerender(
      <SuccessAnimation
        title="Second Title"
        message="Second message"
      />
    );

    expect(getByText('Second Title')).toBeTruthy();
  });

  it('renders with different messages', () => {
    const { getByText, rerender } = render(
      <SuccessAnimation
        title="Title"
        message="First message"
      />
    );

    expect(getByText('First message')).toBeTruthy();

    rerender(
      <SuccessAnimation
        title="Title"
        message="Second message"
      />
    );

    expect(getByText('Second message')).toBeTruthy();
  });

  it('renders with long message text', () => {
    const longMessage = 'This is a very long message that should wrap properly and display correctly in the success animation component without any layout issues';
    const { getByText } = render(
      <SuccessAnimation
        title="Success"
        message={longMessage}
      />
    );

    expect(getByText(longMessage)).toBeTruthy();
  });

  it('has correct icon size', () => {
    const { getByLabelText } = render(
      <SuccessAnimation
        title="Success"
        message="Operation completed"
      />
    );

    const icon = getByLabelText('checkmark');
    expect(icon.props.size).toBe(40);
  });

  it('has white icon color', () => {
    const { getByLabelText } = render(
      <SuccessAnimation
        title="Success"
        message="Operation completed"
      />
    );

    const icon = getByLabelText('checkmark');
    expect(icon.props.color).toBe('#FFFFFF');
  });
});
