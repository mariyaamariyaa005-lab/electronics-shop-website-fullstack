package com.smaelectronics.api.controller;

import com.smaelectronics.api.model.Product;
import com.smaelectronics.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // for local dev; restrict to your real frontend domain when you deploy
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // GET /api/products                -> all products
    // GET /api/products?category=X     -> products in one category
    // GET /api/products?search=X       -> products matching name or category
    @GetMapping
    public List<Product> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        if (category != null && !category.isBlank()) {
            return productRepository.findByCategoryIgnoreCase(category);
        }

        if (search != null && !search.isBlank()) {
            return productRepository
                    .findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(search, search);
        }

        return productRepository.findAll();
    }

    // GET /api/products/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {

        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/products  (admin: add a new product)
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {

        Product saved = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /api/products/{id}  (admin: update an existing product)
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product updated) {

        return productRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setCategory(updated.getCategory());
                    existing.setPrice(updated.getPrice());
                    existing.setDescription(updated.getDescription());
                    existing.setImageUrl(updated.getImageUrl());
                    Product saved = productRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/products/{id}  (admin: remove a product)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {

        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
