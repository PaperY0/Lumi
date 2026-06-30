import React from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onResetToHome?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ [ErrorBoundary] 捕获页面错误:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    this.props.onResetToHome?.();
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '40px 24px',
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 460,
              width: '100%',
              borderRadius: 24,
              padding: '40px 32px',
              textAlign: 'center',
              background: 'linear-gradient(145deg, rgba(255,252,255,0.72), rgba(255,245,250,0.58))',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(212,96,122,0.12), rgba(242,189,204,0.18))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <AlertTriangle size={28} color="#D4607A" />
            </div>

            <h2
              style={{
                margin: '0 0 10px',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--deep-plum)',
                letterSpacing: '-0.02em',
              }}
            >
              {this.props.fallbackTitle || '页面出了一点小问题'}
            </h2>

            <p
              style={{
                margin: '0 0 28px',
                fontSize: 14,
                color: 'var(--graphite-rose)',
                lineHeight: 1.65,
                opacity: 0.75,
              }}
            >
              {this.props.fallbackDescription ||
                '刚刚这个页面没有正常加载，你可以尝试刷新页面，或回到首页重新进入。'}
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 20px',
                  borderRadius: 999,
                  border: '1px solid rgba(212,96,122,0.25)',
                  background: 'rgba(255,255,255,0.6)',
                  color: '#D4607A',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} />
                重试
              </button>

              {this.props.onResetToHome && (
                <button
                  onClick={this.handleGoHome}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 20px',
                    borderRadius: 999,
                    border: '1px solid rgba(212,96,122,0.25)',
                    background: 'rgba(255,255,255,0.6)',
                    color: '#D4607A',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Home size={14} />
                  回到首页
                </button>
              )}

              <button
                onClick={this.handleRefresh}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 20px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #D4607A, #BF8E6E)',
                  border: 'none',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} />
                刷新页面
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
