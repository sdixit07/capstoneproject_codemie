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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * MockMvc tests for GET /api/products/{id}:
 *  - 200 OK with the product body when found
 *  - 404 Not Found when the id does not exist
 *  - 400 Bad Request when the id path variable is not numeric
 */
@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerGetByIdTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    CategoryRepository categoryRepository;

    Long productId;

    @BeforeEach
    void setup() {
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        Category electronics = new Category();
        electronics.setName("Electronics");
        electronics = categoryRepository.save(electronics);

        Product smartPhone = new Product();
        smartPhone.setName("Smart phone");
        smartPhone.setDescription("Latest model smart phone.");
        smartPhone.setImageUrl("https://placehold.co/600x400");
        smartPhone.setPrice(599.99);
        smartPhone.setCategory(electronics);
        smartPhone = productRepository.save(smartPhone);

        productId = smartPhone.getId();
    }

    @Test
    void getProductById_found_returns200WithProductBody() throws Exception {
        mockMvc.perform(get("/api/products/{id}", productId).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId))
                .andExpect(jsonPath("$.name").value("Smart phone"))
                .andExpect(jsonPath("$.description").value("Latest model smart phone."))
                .andExpect(jsonPath("$.imageUrl").value("https://placehold.co/600x400"))
                .andExpect(jsonPath("$.price").value(599.99))
                .andExpect(jsonPath("$.category.name").value("Electronics"));
    }

    @Test
    void getProductById_notFound_returns404WithApiErrorBody() throws Exception {
        long missingId = productId + 1000;

        mockMvc.perform(get("/api/products/{id}", missingId).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.path").value("/api/products/" + missingId))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void getProductById_invalidId_returns400WithApiErrorBody() throws Exception {
        mockMvc.perform(get("/api/products/{id}", "not-a-number").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.path").value("/api/products/not-a-number"))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
