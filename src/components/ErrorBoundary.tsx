import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a2311 0%, #232e14 50%, #1e2812 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#e8f0d8',
        }}
      >
        {/* Olive leaf icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'rgba(111, 154, 53, 0.15)',
            border: '1px solid rgba(111, 154, 53, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            marginBottom: '1.5rem',
          }}
        >
          🌿
        </div>

        <h1
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontWeight: 700,
            color: '#f0f4e8',
            textAlign: 'center',
            marginBottom: '0.75rem',
            lineHeight: 1.2,
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            color: '#8bb451',
            textAlign: 'center',
            maxWidth: '420px',
            lineHeight: 1.6,
            marginBottom: '2rem',
            fontSize: '1rem',
          }}
        >
          An unexpected error occurred. Don't worry — your data is safe.
          Let's get you back on track.
        </p>

        {/* Error details only in dev mode */}
        {import.meta.env.DEV && this.state.error && (
          <details
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(111,154,53,0.2)',
              borderRadius: '12px',
              padding: '1rem',
              maxWidth: '560px',
              width: '100%',
              marginBottom: '1.5rem',
              cursor: 'pointer',
            }}
          >
            <summary style={{ color: '#8bb451', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              Error details (dev only)
            </summary>
            <pre
              style={{
                color: '#fca5a5',
                fontSize: '0.75rem',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
              }}
            >
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          </details>
        )}

        <button
          onClick={this.handleReset}
          style={{
            padding: '0.85rem 2rem',
            borderRadius: '14px',
            background: '#6f9a35',
            color: 'white',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#8bb451'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#6f9a35'; }}
        >
          ← Back to home
        </button>
      </div>
    );
  }
}
