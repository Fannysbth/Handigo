import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Ada yang salah.</h2>
            <p className="text-gray-600 text-sm mb-6">
              Terjadi kesalahan pada aplikasi. Silakan muat ulang halaman.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-semibold transition"
              autoFocus
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
