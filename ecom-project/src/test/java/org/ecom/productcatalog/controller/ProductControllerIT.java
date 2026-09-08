package org.ecom.productcatalog.controller;

import org.ecom.productcatalog.Product;
import org.ecom.productcatalog.model.Category;
import org.ecom.productcatalog.repository.CategoryRepository;
import org.ecom.productcatalog.repository.ProductRepository;
import org.juniter.api.BeforeEach;
import org.junit.jupiter.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.webserver.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMVcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerIT {

  @Autowired
  MockMvc mockMvc;

  @Autowired
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
  void getProducts_defaultPagedStructure_returnsPagedResponse() throws Exception {
    mockMvc.perform(get("/api/products").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items").isArray())
        .andExpect(jsonPath("$.page").value(0))
        .andExpect(jsonPath("$.totalItems").value(25))
        .andExpect(jsonPath("$.totalPages").value(3));
  }

  @Test
  void getProducts_supportsPagingParams() throws Exception {
    mockMvc.perform(get("/api/products").param("page", "0").param("size", "5"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.size").value(5));
  }

  @Test
  void getProducts_supportsSearchParam() throws Exception {
    mockMvc.perform(get("/api/products").param("search", "iPhone 2").param("size", "50"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items").isArray())
        .andExpect(jsonPath("$.items[0].name", containsStringIgnoringCase("iphone")));
  }

  @Test
  void getProducts_supportsCategoryFilter() throws Exception {
    mockMvc.perform(get("/api/products").param("categoryId", String.valueOf(catId)).param("size", "50"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalItems", greaterThan(0)));
  }

  @Test
  void getProducts_supportsSortParam() throws Exception {
    mockMvc.perform(get("/api/products").param("sort", "price,desc").param("size", "5"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items[0].price", greaterThan(120.0)));
  }
}
