import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ height: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
        <div>
          <h2>Something went wrong</h2>
          <p style={{ color: "#6b7280" }}>Please reload the app.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 24px", borderRadius: 24, border: 0, background: "#f97316", color: "#fff" }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;