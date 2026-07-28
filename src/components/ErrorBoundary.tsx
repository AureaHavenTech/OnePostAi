"use client";

import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — catches React rendering errors in any section.
 * One component crash won't kill the entire dashboard.
 *
 * Usage:
 *   <ErrorBoundary section="campaigns" onReset={() => refetch()}>
 *     <CampaignView campaigns={data} />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.section ? `:${this.props.section}` : ""}]`,
      error.message,
      errorInfo.componentStack
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="mb-1 text-sm font-semibold text-red-400">
            Something went wrong
            {this.props.section ? ` in ${this.props.section}` : ""}
          </h3>
          <p className="mb-4 text-xs text-red-300/60">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={this.handleReset}
            className="rounded-lg bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400
                       transition-colors hover:bg-red-500/20 active:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight error boundary with a minimal inline fallback.
 * Good for wrapping individual widgets or cards.
 */
export function InlineErrorFallback({ message = "Failed to load" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
      <span className="text-xs text-red-400">{message}</span>
    </div>
  );
}
