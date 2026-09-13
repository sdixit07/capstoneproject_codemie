#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Building E-Commerce Application"
echo "================================"
echo "Project Root: $PROJECT_ROOT"
echo ""

# Backend build
echo "Building Backend (Spring Boot)..."
cd "$PROJECT_ROOT/ecom-project"
./mvnw clean package -DskipTests
echo "Backend build completed successfully!"
echo ""

# Frontend build
echo "Building Frontend (React + Vite)..."
cd "$PROJECT_ROOT/ecom-front/ecom-catalog-react"
npm install
npm run build
echo "Frontend build completed successfully!"
echo ""

echo "================================"
echo "Build completed successfully!"
echo "Backend JAR: $PROJECT_ROOT/ecom-project/target/*.jar"
echo "Frontend dist: $PROJECT_ROOT/ecom-front/ecom-catalog-react/dist"
