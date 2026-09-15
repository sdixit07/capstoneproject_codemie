/**
 * Reusable Bootstrap spinner used to indicate an in-flight request.
 *
 * Props:
 * - label: accessible/visible text shown next to the spinner
 * - size: 'sm' for an inline/small spinner, defaults to a full-size spinner
 */
const LoadingIndicator = ({ label = 'Loading...', size }) => {
  const spinnerClass = size === 'sm' ? 'spinner-border spinner-border-sm' : 'spinner-border';

  return (
    <div className="text-center my-4" role="status" aria-live="polite">
      <div className={spinnerClass}>
        <span className="visually-hidden">{label}</span>
      </div>
      {size !== 'sm' && <p className="mt-2 mb-0">{label}</p>}
    </div>
  );
};

export default LoadingIndicator;
