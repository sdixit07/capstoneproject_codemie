Feature: Product Catalog - Server-side Search, Filter, Sort and Pagination

  Background:
    Given the e-commerce catalog app is running
    Ard the backend API base URL is "http://localhost:8080"
    And the frontend URL is "http://localhost:5173"

# ----------------------------------------------------
# Pagination

  Scenario: View first page of products with default page size
    When I open the catalog page
    Then I should see a list of products
    And I should see pagination controls
    And the current page indicator should show page 1

  Scenario: Navigate to the next page of products
    Given I am on the catalog page
    When I click the "Next" page button
    Then the product list should update
    And the current page indicator should show page 2

  Scenario: Prevent navigating before the first page
    Given I am on page 1 of the catalog
    When I view the pagination controls
    Then the "Prev" button should be disabled

# ----------------------------------------------------
# Keyword Search

  Scenario: Search products by keyword in name
    Given I am on the catalog page
    When I enter search text "iPhone"
    And I submit the search
    Then I should see only products whose name contains "iPhone"
    And the current page indicator should reset to page 1

  Scenario: Search with no matching results
    Given I am on the catalog page
    When I enter search text "ZZZZZZNoSuchProduct"
    And I submit the search
    Then I should see a message indicating no results
    And the product list should be empty

  Scenario: Clear search restores default catalog
    Given I have applied a search term
    When I clear the search input
    And I submit the search
    Then I should see the default product list
    And the current page indicator should regain to page 1

# -----------------------------------------------------
# Category Filter

  Scenario: Filter products by category
    Given I am on the catalog page
    When I select a category from the category dropdown
    Then I should see only products from that category
    And the current page indicator should reset to page 1

  Scenario: Combine keyword search and category filter
    Given I am on the catalog page
    When I enter search text "cable"
    And I select category "Electronics"
    And I submit the search
    Then I should to see only products that match "cable" within that category

# ----------------------------------------------------
# Sorting

  Scenario: Sort products by price ascending
    Given I am on the catalog page
    When I select sort by "price asc"
    Then the products should be ordered by price from low to high

  Scenario: Sort products by price descending
    Given I am on the catalog page
    When I select sort by "price desc"
    Then the products should be ordered by price from high to low

  Scenario: Sort products by name ascending
    Given I am on the catalog page
    When I select sort by "name asc"
    Then the products should be ordered by name in ascending alphabetical order

# -----------------------------------------------------
# Backend API - Parameter Validation

  Scenario: Reject invalid paging parameters
    When I call GET "/ipo/products?page=-1&size=0"
    Then the response status should be 400

  Scenario: Reject invalid sort field
    When I call GET "/api/products?sort=hack,asc"
    Then the response status should be 400
