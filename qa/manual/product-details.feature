Feature: Product Details Page and API

  Background:
    Given the e-commerce catalog app is running
    And the backend API base URL is "http://localhost:8080"
    And the frontend URL is "http://localhost:5173"

# ----------------------------------------------------
# Frontend navigation

  Scenario: Navigate from catalog to product details by clicking a card
    Given I am on the catalog page
    When I click on a product card
    Then I should be navigated to the product details page for that product
    And I should see the product's name, description, image, price, and category

  Scenario: Deep link directly to an existing product's details page
    When I navigate directly to "/products/1"
    Then I should see the product details page for product id 1
    And I should see the product's name, description, image, price, and category

  Scenario: Deep link to a non-existent product id shows not-found message
    When I navigate directly to "/products/999999"
    Then I should see a "not found" message
    And I should see a link to go back to the catalog

  Scenario: Deep link to an invalid (non-numeric) product id shows an error
    When I navigate directly to "/products/abc"
    Then I should see an invalid product id error message

# ----------------------------------------------------
# Backend API - GET /api/products/{id}

  Scenario: Fetch an existing product by id returns 200 with full details
    When I call GET "/api/products/1"
    Then the response status should be 200
    And the response body should contain field "id"
    And the response body should contain field "name"
    And the response body should contain field "description"
    And the response body should contain field "imageUrl"
    And the response body should contain field "price"
    And the response body should contain field "category.id"
    And the response body should contain field "category.name"

  Scenario: Fetch a non-existent product id returns 404
    When I call GET "/api/products/999999"
    Then the response status should be 404
    And the response body field "status" should equal 404

  Scenario: Fetch an invalid (non-numeric) product id returns 400
    When I call GET "/api/products/abc"
    Then the response status should be 400
    And the response body field "status" should equal 400
