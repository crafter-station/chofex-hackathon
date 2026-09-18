"use client";

import { Component, Fragment, type ReactNode } from "react";

/** One retry after a transient load abort, then the fallback holds the frame. */
const MAX_RETRIES = 1;
/** A short pause so the retry does not fire against the just-aborted connection. */
const RETRY_DELAY_MS = 400;

type ModelErrorBoundaryProps = {
  readonly children: ReactNode;
  readonly fallback: ReactNode;
  /**
   * Reports the failure. `attempt` is 0 on the first error and 1 on the retry,
   * so a caller can measure how often the retry is reached.
   */
  readonly onError?: (error: unknown, attempt: number) => void;
  /**
   * Runs once before the retry remounts the children. The loader caches the
   * rejected fetch under its URL, so the retry only refetches if the caller
   * clears that cache here.
   */
  readonly onRetry?: () => void;
};

type ModelErrorBoundaryState = {
  hasError: boolean;
  attempt: number;
};

export class ModelErrorBoundary extends Component<
  ModelErrorBoundaryProps,
  ModelErrorBoundaryState
> {
  state: ModelErrorBoundaryState = { hasError: false, attempt: 0 };
  private retryTimer: ReturnType<typeof setTimeout> | undefined;

  static getDerivedStateFromError(): Partial<ModelErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error, this.state.attempt);

    if (this.state.attempt >= MAX_RETRIES) {
      return;
    }

    this.retryTimer = setTimeout(() => {
      this.props.onRetry?.();
      this.setState((previous) => ({
        hasError: false,
        attempt: previous.attempt + 1,
      }));
    }, RETRY_DELAY_MS);
  }

  componentWillUnmount() {
    if (this.retryTimer !== undefined) {
      clearTimeout(this.retryTimer);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    // The key remounts the children on retry, so the loader hook runs again
    // against the cache the onRetry callback just cleared.
    return <Fragment key={this.state.attempt}>{this.props.children}</Fragment>;
  }
}
