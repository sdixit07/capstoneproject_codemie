package org.ecom.productcatalog.service;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.exception.InvalidProductQueryException;
import org.ecom.productcatalog.repository.ProductRepository;
import org.ecom.productcatalog.repository.specification.ProductSpecifications;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ProductService {

    /** Entity attributes callers are allowed to sort on. */
    private static final Set<String> SORTABLE_FIELDS = Set.of("id", "name", "price");

    @Autowired
    public ProductRepository productRepository;

    public List<Product> getAllProducts(){
        return productRepository.findAll();
    }

    public List<Product> getProductByCategory(Long categoryId){
        return productRepository.findByCategoryId(categoryId);
    }

    /**
     * Returns the catalog filtered by any combination of the optional criteria.
     * A {@code null} argument means the corresponding filter is not applied, so
     * calling this method without arguments is equivalent to {@link #getAllProducts()}.
     *
     * @param categoryId only products of this category
     * @param minPrice   inclusive lower price bound
     * @param maxPrice   inclusive upper price bound
     * @param search     case insensitive match on name or description
     * @param sort       "field,direction" e.g. "price,desc"
     */
    public List<Product> getProducts(Long categoryId,
                                     Double minPrice,
                                     Double maxPrice,
                                     String search,
                                     String sort){
        validatePriceRange(minPrice, maxPrice);
        Sort sortOrder = parseSort(sort);
        return productRepository.findAll(
                ProductSpecifications.withFilters(categoryId, minPrice, maxPrice, search),
                sortOrder);
    }

    /** Convenience overload for the price range filter only. */
    public List<Product> getProductsByPriceRange(Double minPrice, Double maxPrice){
        return getProducts(null, minPrice, maxPrice, null, null);
    }

    /**
     * Rejects price ranges that can never match anything.
     *
     * @throws InvalidProductQueryException if a bound is negative or minPrice > maxPrice
     */
    void validatePriceRange(Double minPrice, Double maxPrice){
        if (minPrice != null && minPrice < 0) {
            throw new InvalidProductQueryException("minPrice must not be negative but was " + minPrice);
        }
        if (maxPrice != null && maxPrice < 0) {
            throw new InvalidProductQueryException("maxPrice must not be negative but was " + maxPrice);
        }
        if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
            throw new InvalidProductQueryException(
                    "minPrice (" + minPrice + ") must be less than or equal to maxPrice (" + maxPrice + ")");
        }
    }

    /**
     * Parses the "field,direction" sort parameter.
     *
     * @return {@link Sort#unsorted()} when no sort was requested
     * @throws InvalidProductQueryException for unknown fields or directions
     */
    Sort parseSort(String sort){
        if (sort == null || sort.isBlank()) {
            return Sort.unsorted();
        }
        String[] parts = sort.split(",");
        String field = parts[0].trim();
        if (!SORTABLE_FIELDS.contains(field)) {
            throw new InvalidProductQueryException(
                    "Unsupported sort field '" + field + "'. Supported fields: " + SORTABLE_FIELDS);
        }
        if (parts.length == 1) {
            return Sort.by(Sort.Direction.ASC, field);
        }
        String direction = parts[1].trim();
        try {
            return Sort.by(Sort.Direction.fromString(direction), field);
        } catch (IllegalArgumentException ex) {
            throw new InvalidProductQueryException(
                    "Unsupported sort direction '" + direction + "'. Use 'asc' or 'desc'");
        }
    }
}
