package org.ecom.productcatalog.controller;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.model.Category;
import org.ecom.productcatalog.repository.CategoryRepository;
import org.ecom.productcatalog.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Covers server-side sorting (sortBy / sortDir) on the product endpoints.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ProductSortingTests {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    CategoryRepository categoryRepository;

    Long electronicsId;
    Long clothingId;

    @BeforeEach
    void setup() {
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        Category electronics = new Category();
        electronics.setName("Electronics");
        electronics = categoryRepository.save(electronics);
        electronicsId = electronics.getId();

        Category clothing = new Category();
        clothing.setName("Clothing");
        clothing = categoryRepository.save(clothing);
        clothingId = clothing.getId();

        // Inserted so that insertion (id) order differs from both name order and price order.
        saveProduct("Zephyr Speaker", 50.0, electronics);
        saveProduct("Alpha Laptop", 900.0, electronics);
        saveProduct("Mid Monitor", 300.0, electronics);
        saveProduct("Yankee Socks", 10.0, clothing);
        saveProduct("Beta Jacket", 120.0, clothing);
    }

    private void saveProduct(String name, double price, Category category) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(name + " description");
        p.setImageUrl("https://placehold.co/600x400");
        p.setPrice(price);
        p.setCategory(category);
        productRepository.save(p);
    }

    @Test
    void getProducts_noSortParams_defaultsToIdAscending() throws Exception {
        mockMvc.perform(get("/api/products").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(5)))
                .andExpect(jsonPath("$.content[*].name", contains(
                        "Zephyr Speaker", "Alpha Laptop", "Mid Monitor", "Yankee Socks", "Beta Jacket")));
    }

    @Test
    void getProducts_sortByPriceDesc_returnsMostExpensiveFirst() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("sortBy", "price")
                        .param("sortDir", "desc")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].price", contains(900.0, 300.0, 120.0, 50.0, 10.0)));
    }

    @Test
    void getProducts_sortByPriceAsc_returnsCheapestFirst() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("sortBy", "price")
                        .param("sortDir", "asc")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].price", contains(10.0, 50.0, 120.0, 300.0, 900.0)));
    }

    @Test
    void getProducts_sortByNameAsc_isAlphabetical() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("sortBy", "name")
                        .param("sortDir", "asc")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].name", contains(
                        "Alpha Laptop", "Beta Jacket", "Mid Monitor", "Yankee Socks", "Zephyr Speaker")));
    }

    @Test
    void getProducts_sortByNameDesc_isReverseAlphabetical() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("sortBy", "name")
                        .param("sortDir", "desc")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].name", contains(
                        "Zephyr Speaker", "Yankee Socks", "Mid Monitor", "Beta Jacket", "Alpha Laptop")));
    }

    @Test
    void getProducts_sortParamsAreCaseInsensitive() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("sortBy", "PRICE")
                        .param("sortDir", "DESC")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].price", contains(900.0, 300.0, 120.0, 50.0, 10.0)));
    }

    @Test
    void getProducts_unknownSortBy_fallsBackToIdAscWithoutError() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("sortBy", "description")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].name", contains(
                        "Zephyr Speaker", "Alpha Laptop", "Mid Monitor", "Yankee Socks", "Beta Jacket")));
    }

    @Test
    void getProducts_unknownSortDir_fallsBackToAscWithoutError() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("sortBy", "price")
                        .param("sortDir", "sideways")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].price", contains(10.0, 50.0, 120.0, 300.0, 900.0)));
    }

    @Test
    void getProducts_blankSortParams_fallBackToDefaults() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("sortBy", "")
                        .param("sortDir", "")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].name", contains(
                        "Zephyr Speaker", "Alpha Laptop", "Mid Monitor", "Yankee Socks", "Beta Jacket")));
    }

    @Test
    void getProductsByCategory_noSortParams_defaultsToIdAscending() throws Exception {
        mockMvc.perform(get("/api/products/category/{categoryId}", electronicsId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.content[*].name", contains("Zephyr Speaker", "Alpha Laptop", "Mid Monitor")));
    }

    @Test
    void getProductsByCategory_sortByPriceDesc_sortsWithinCategoryOnly() throws Exception {
        mockMvc.perform(get("/api/products/category/{categoryId}", electronicsId)
                        .param("sortBy", "price")
                        .param("sortDir", "desc")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)))
                .andExpect(jsonPath("$.content[*].name", contains("Alpha Laptop", "Mid Monitor", "Zephyr Speaker")));
    }

    @Test
    void getProductsByCategory_sortByNameAsc_isAlphabetical() throws Exception {
        mockMvc.perform(get("/api/products/category/{categoryId}", clothingId)
                        .param("sortBy", "name")
                        .param("sortDir", "asc")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[*].name", contains("Beta Jacket", "Yankee Socks")));
    }

    @Test
    void getProductsByCategory_invalidSortParams_fallBackToDefaults() throws Exception {
        mockMvc.perform(get("/api/products/category/{categoryId}", electronicsId)
                        .param("sortBy", "category")
                        .param("sortDir", "up")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].name", contains("Zephyr Speaker", "Alpha Laptop", "Mid Monitor")));
    }
}
