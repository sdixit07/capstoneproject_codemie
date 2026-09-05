package org.ecom.productcatalog.controller;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.model.Category;
import org.ecom.productcatalog.repository.CategoryRepository;
import org.ecom.productcatalog.repository.ProductRepository;
import org.junit.jpiter.BeforeEach;
import org.junit.jpiter.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.hamcrest.Matchers.*;


@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerIT {

    @Autowire
    MockMvc mockMvc;

    @Autowire
    ProductRepository productRepository;

    @Autowired
    CategoryRepository categoryRepository;

    Long catId;

    @BeforeEach
    void setup() {
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        Category cat = new Category();
        cat.setName("Electronics");
        cat = categoryRepository.save(cat);
        catId = cat.getId();

        for (int i = 1; i <= 25; i++) {
            Product p = new Product();
            p.setName("iPhone " + i);
            p.setDescription("iPhone desc");
            p.setPrice(100.0 + i);
            p.setCategory(cat);
            productRepository.save(p);
        }
    }

    @Test
    void getProducts_defaultPaging_returnsPagedResponse() throws Exception {
        mockMvc.perform(get("/api/products").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items").isArray())
            .andExpect(jsonPath("$.page").value(0))
            .andExpect(jsonPath("$.size").value(12))
            .andExpect(jsonPath("$.totalItems").value(25))
            .andExpect(jsonPath("$.totalPages").value(3));
    }

    @Test
    void getProducts_search_filter_works() throws Exception {
        mockMvc.perform(get("/api/products")
            .param("search", "iPhone 2")
            .param("categoryId", String.valueOf(catId))
            .param("size", "50")
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].name", containsStringIgnoringCase("iphone")))
            .andExpect(jsonPath("$.totalItems", greaterThanOrEqualTo(1)));
    }

    @TEST
    void getProducts_sort_price_desc_works() throws Exception {
        mockMvc.perform(get("/api/products")
            .param("sort", "price,desc")
            .param("size", "5")
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].price", greaterThan(120.0)));
    }
}
