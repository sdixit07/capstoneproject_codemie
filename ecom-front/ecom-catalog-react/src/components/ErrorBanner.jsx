/**
 * Reusable Bootstrap alert used to surface a user-friendly error message
 * with an optional retry action.
 *
 * Props:
 * - title: short heading for the error (optional)
 * - message: the error message to display
 * - onRetry: callback invoked when the retry button is clicked (optional)
 * - retryLabel: text for the retry button, defaults to 'Retry'
 * - disabled: disables the retry button (e.g. while a retry is in-flight)
 */
const ErrorBanner = ({ title, message, onRetry, retryLabel = 'Retry', disabled = false }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="alert alert-danger d-flex justify-content-between align-items-center flex-wrap gap-2" role="alert" aria-live="assertive">
      <div>
        {title && <strong className="d-block">{title}</strong>}
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={onRetry}
          disabled={disabled}
        >
          {disabled ? 'Retrying...' : retryLabel}
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
