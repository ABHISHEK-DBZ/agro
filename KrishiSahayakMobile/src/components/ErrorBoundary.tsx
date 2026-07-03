// Error Boundary — Prevents crashes from taking down the entire app
// Uses ONLY inline styles so it can render even if the theme context is broken
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error.message);
    this.setState({ errorInfo });
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided (allows parent to render something themed)
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fully self-contained fallback — NO theme imports, all inline styles
      const s = styles;

      return (
        <View style={s.container}>
          <View style={s.content}>
            <Text style={s.icon}>⚠️</Text>
            <Text style={s.title}>Something went wrong</Text>
            <Text style={s.message}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>

            {this.state.error && (
              <ScrollView style={s.errorDetails} showsVerticalScrollIndicator={false}>
                <Text style={s.stackText}>
                  {this.state.error.stack?.toString().slice(0, 500)}
                </Text>
              </ScrollView>
            )}

            <View style={s.actions}>
              <TouchableOpacity
                style={s.retryBtn}
                onPress={this.handleTryAgain}
                activeOpacity={0.7}
              >
                <Text style={s.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Inline styles — no theme dependencies
const GREEN = '#1B7A3D';
const GREEN_DARK = '#145A2D';
const BG = '#F8FAF5';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const WHITE = '#FFFFFF';

const styles = {
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 24,
  },
  content: {
    width: '100%' as const,
    maxWidth: 400,
    alignItems: 'center' as const,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: TEXT_PRIMARY,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 16,
  },
  errorDetails: {
    maxHeight: 150,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    width: '100%' as const,
    marginBottom: 24,
  },
  stackText: {
    fontSize: 11,
    color: '#DC2626',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  actions: {
    width: '100%' as const,
    gap: 12,
  },
  retryBtn: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: WHITE,
  },

};

export default ErrorBoundary;
