import React from 'react'

type Props = { children: React.ReactNode; fallback?: React.ReactNode }
type State = { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-6 text-center">
            <div className="text-lg font-semibold mb-1">Something went wrong</div>
            <div className="text-sm text-gray-600">Please go back and try again.</div>
            {this.state.error?.message ? (
              <div className="mt-3 text-xs text-red-600 break-words">
                {this.state.error.message}
              </div>
            ) : null}
          </div>
        )
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary


