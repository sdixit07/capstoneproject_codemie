/**
 * Previous / Next controls for the server side paged catalog.
 *
 * `page` is the zero based index the backend uses; the label shows the human
 * friendly 1 based number. Both buttons are disabled at the respective ends so
 * the component can never ask the backend for a page that does not exist.
 */
const Pagination = ({ page, totalPages, totalElements, onPageChange }) => {
  // An empty result still renders one (empty) page rather than "Page 1 of 0".
  const lastPage = Math.max(totalPages, 1);
  const isFirstPage = page <= 0;
  const isLastPage = page >= lastPage - 1;

  return (
    <nav className='d-flex align-items-center justify-content-center gap-3 my-4'
         aria-label='Product pages'>
      <button
        type='button'
        className='btn btn-outline-primary'
        onClick={() => onPageChange(page - 1)}
        disabled={isFirstPage}>
        Previous
      </button>

      <span aria-live='polite' data-testid='page-indicator'>
        Page {page + 1} of {lastPage}
        {Number.isInteger(totalElements) ? ` (${totalElements} products)` : ''}
      </span>

      <button
        type='button'
        className='btn btn-outline-primary'
        onClick={() => onPageChange(page + 1)}
        disabled={isLastPage}>
        Next
      </button>
    </nav>
  );
};

export default Pagination;
