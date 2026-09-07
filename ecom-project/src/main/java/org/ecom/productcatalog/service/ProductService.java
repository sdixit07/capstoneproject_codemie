package org.ecom.productcatalog.service;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.repository.ProductRepository;
import org.ecom.productcatalog.specification.ProductSpecifications;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    public ProductRepository productRepository;

    public List<Product> getAllProducts(){
        return productRepository.findAll();
    }

    public List<Product> getProductByCategory(Long categoryId){
        // kept for backward compatibility, but now implemented via specification
        Specification<Product> spec = Specification.where(ProductSpecifications.hasCategoryId(categoryId));
        return productRepository.findAll(spec);
    }

    public Page<Product> searchProducts(String search, Long categoryId, Pageable pageable) {
        Specification<Product> spec = Specification
                .where(ProductSpecifications.nameContainsIgnoreCase(search))
                .and(ProductSpecifications.hasCategoryId(categoryId));

        return productRepository.findAll(spec, pageable);
    }
}
