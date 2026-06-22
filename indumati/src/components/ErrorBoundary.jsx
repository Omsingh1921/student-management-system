import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
          <div className="rounded-3xl border border-rose-200 bg-white p-10 text-center shadow-soft dark:border-rose-900 dark:bg-slate-900">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Something went wrong.</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Refresh the page or contact support if the issue persists.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
