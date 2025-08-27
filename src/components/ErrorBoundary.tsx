import React from 'react';

// Attempt to load the Sentry SDK. If it's not installed, fall back to no-op.
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

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log locally
    // eslint-disable-next-line no-console
    console.error(error, info.componentStack);
    // Forward to Sentry if available
    try {
      Sentry?.captureException?.(error);
    } catch {
      // ignore
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
