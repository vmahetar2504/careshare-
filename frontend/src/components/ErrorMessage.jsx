import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({ message, onRetry, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800 shadow-sm flex items-start gap-3 ${className}`}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-white border border-rose-200 rounded-lg px-2.5 py-1 transition-colors hover:bg-rose-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
