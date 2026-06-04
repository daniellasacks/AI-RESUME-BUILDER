import { Component } from 'react'
import type { ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="rounded-2xl border border-rose-900 bg-rose-950/40 p-6 text-sm text-rose-100">
        <div className="text-base font-semibold">Something went wrong</div>
        <div className="mt-2 text-xs opacity-90">{this.state.error.message}</div>
      </div>
    )
  }
}

