import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Guild Master render failure.', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return <main className="loading-screen error-screen" role="alert">
      <strong>Unable to continue this guild session.</strong>
      <p>Your local backup remains untouched. Reload the page to try again.</p>
      <code>{this.state.error.message}</code>
    </main>
  }
}
