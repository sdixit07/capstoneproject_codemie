package org.ecom.productcatalog.exception;

/**
 * Thrown when a requested product cannot be found by its id.
 */
public class ProductNotFoundException extends RuntimeException {

    public ProductNotFoundException(Long id) {
        super("Product not found with id: " + id);
    }
}
