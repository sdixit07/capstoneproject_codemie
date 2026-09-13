package org.ecom.productcatalog.service;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ProductService {

    /** Properties a client is allowed to sort by. Anything else falls back to the default. */
    public static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "name", "price");
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIR = "asc";

    @Autowired
    public ProductRepository productRepository;

    public List<Product> getAllProducts(){
        return getAllProducts(DEFAULT_SORT_BY, DEFAULT_SORT_DIR);
    }

    public List<Product> getAllProducts(String sortBy, String sortDir){
        return productRepository.findAll(buildSort(sortBy, sortDir));
    }

    public List<Product> getProductByCategory(Long categoryId){
        return getProductByCategory(categoryId, DEFAULT_SORT_BY, DEFAULT_SORT_DIR);
    }

    public List<Product> getProductByCategory(Long categoryId, String sortBy, String sortDir){
        return productRepository.findByCategoryId(categoryId, buildSort(sortBy, sortDir));
    }

    /**
     * Builds a Spring Data {@link Sort} from raw request params. Unknown fields or
     * directions are ignored and silently replaced by the defaults (id, asc) so that
     * a bad query string never fails the request.
     */
    public static Sort buildSort(String sortBy, String sortDir){
        String field = sortBy == null ? "" : sortBy.trim();
        if (!ALLOWED_SORT_FIELDS.contains(field.toLowerCase())) {
            field = DEFAULT_SORT_BY;
        } else {
            field = field.toLowerCase();
        }

        String direction = sortDir == null ? "" : sortDir.trim().toLowerCase();
        Sort.Direction resolvedDirection = "desc".equals(direction)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        return Sort.by(resolvedDirection, field);
    }
}
