// Import express to create the router and necessary controllers for handling product-related routes
import express from "express";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/productController";

// Create an instance of the Express Router to define product routes
const router = express.Router();

// Define a route for creating a new product (POST request)
// When a POST request is made to "/api/products", the createProduct controller is called
router.post("/", createProduct);

// Define a route for getting a list of products (GET request)
// When a GET request is made to "/api/products/getProducts", the getProducts controller is called
router.get("/getProducts", getProducts);

// Define routes for handling product by ID
// A GET request to "/api/products/:id" will call getProductById to fetch a product by its ID
// A PUT request to "/api/products/:id" will call updateProduct to update a product's details by its ID
// A DELETE request to "/api/products/:id" will call deleteProduct to remove a product by its ID
router
  .route("/:id")
  .get(getProductById) // Get product by ID
  .put(updateProduct) // Update product by ID
  .delete(deleteProduct); // Delete product by ID

// Export the router so it can be used in other parts of the application (e.g., in the main app file)
export default router;
