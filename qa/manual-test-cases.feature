Feature: Product entity package refactor regression

  Background:
    Given the backend service is running locally

  Scenario: List all products still works after Product entity refactor
    When I send a GET request to "/api/products"
    Then the response status should be 200
    And the response should be a JSON array
    And each product should contain "id", "name", "description", "imageUrl", "price"
    And each product should contain a "category" object with "id" and "name"

  Scenario: List categories still works after Product entity refactor
    When I send a GET request to "/api/categories"
    Then the response status should be 200
    And the response should be a JSON array
    And each category should contain "id" and "name"

  Scenario: Filter products by category still works after Product entity refactor
    Given I know an existing category id
    When I send a GET request to "/api/products/category/{categoryId}"
    Then the response status should be 200
    And the response should be a JSON array