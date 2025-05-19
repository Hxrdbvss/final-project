import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center mt-10">
          <h1 className="text-2xl font-bold text-gray-900">Что-то пошло не так</h1>
          <p className="text-gray-800 mt-2">
            Пожалуйста, перезагрузите страницу или обратитесь в поддержку.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;