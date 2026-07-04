'use client';

import React from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState } from '@/types/landing';

/**
 * ErrorBoundary
 *
 * React class-based Error Boundary. Catches runtime errors in child subtrees
 * and renders a minimal dark-themed fallback instead of crashing the full page.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // In production you would pipe this to your observability platform (e.g. Datadog, Sentry)
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] caught:', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            display:       'flex',
            alignItems:    'center',
            justifyContent:'center',
            minHeight:     '160px',
            background:    '#0D0D0D',
            border:        '1px solid #1F1F1F',
            padding:       '2rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily:    'var(--font-manrope), system-ui, sans-serif',
                fontSize:      '11px',
                fontWeight:    700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color:         '#9CA3AF',
                marginBottom:  '0.5rem',
              }}
            >
              Section Unavailable
            </p>
            <p
              style={{
                fontFamily: 'var(--font-manrope), system-ui, sans-serif',
                fontSize:   '10px',
                color:      '#4B5563',
              }}
            >
              {process.env.NODE_ENV === 'development'
                ? this.state.error?.message ?? 'Unknown error'
                : 'This section failed to load. Please refresh.'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
