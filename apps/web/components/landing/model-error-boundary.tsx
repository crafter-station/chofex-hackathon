"use client";

import { Component, type ReactNode } from "react";

type ModelErrorBoundaryProps = {
  readonly children: ReactNode;
  readonly fallback: ReactNode;
};

type ModelErrorBoundaryState = {
  hasError: boolean;
};

export class ModelErrorBoundary extends Component<
  ModelErrorBoundaryProps,
  ModelErrorBoundaryState
> {
  state: ModelErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ModelErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
