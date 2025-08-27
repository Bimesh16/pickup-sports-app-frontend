import React from 'react';

// Attempt to load the Sentry SDK. If it's not installed (e.g. in test
// environments), the require call will fail and we fall back to a no-op.
// eslint-disable-next-line @typescript-eslint/no-var-requires
let Sentry: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require('@sentry/react-native');
} catch {
  Sentry = undefined;
}

type Props = {
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      // Temporary logging until monitoring (e.g., Sentry) is added
      console.error(error, errorInfo.componentStack);
    }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log locally first
    console.error(error, info.componentStack);
    // Then forward to Sentry if available
    Sentry?.captureException?.(error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
