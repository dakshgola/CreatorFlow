import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught a render crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center p-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 m-6">
          <div className="max-w-md w-full p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-6">
              An error occurred while loading this page. Please try refreshing or reloading.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn-secondary flex-1 py-2 text-xs"
              >
                Reset UI State
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary flex-1 py-2 text-xs"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export { ErrorBoundary };
