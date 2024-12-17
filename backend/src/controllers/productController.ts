// Import Request and Response types from Express for handling HTTP requests and responses
import { Request, Response } from "express";

// Import the Prisma client configuration to interact with the database using Prisma ORM
import prisma from "../config/prismaClient";

// Import the asyncHandler middleware to handle asynchronous errors
import asyncHandler from "../middlewares/asyncHandler";

// Function to create a new product
const createProduct = asyncHandler(async (req: Request, res: Response) => {
  // Extract product data (name, price, stock) from the request body
  const { name, price, stock } = req.body;

  // Validate input: ensure all fields are provided
  if (!name || !price || !stock) {
    res.status(400); // Status 400 if any field is missing
    throw new Error("Please add all fields");
  }

  // Validate that price and stock are greater than or equal to 0
  if (price < 0 || stock < 0) {
    res.status(400).json({
      message: "Stock and price must be greater or equal than 0",
    });
  }

  // Create a new product in the database using Prisma
  const newProduct = await prisma.product.create({
    data: {
      name,
      price: parseFloat(price), // Convert price to float
      stock: parseInt(stock), // Convert stock to integer
    },
  });

  // Send a response with status 201 and the newly created product data
  res.status(201).json(newProduct);
});

// Function to update an existing product
const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  // Extract product data (name, price, stock) and product id from the request body and params
  const { name, price, stock } = req.body;
  const { id } = req.params;

  // Validate input: ensure all fields are provided
  if (!id || !name || !price || !stock) {
    res.status(400); // Status 400 if any field is missing
    throw new Error("Please add all fields");
  }

  // Validate that price and stock are greater than or equal to 0
  if (price < 0 || stock < 0) {
    res.status(400).json({
      message: "Stock and price must be greater or equal than 0",
    });
  }

  // Find the product by its id
  const findProduct = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  // If the product is not found, send status 404 and an error message
  if (!findProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Update the product in the database using Prisma
  const updateProduct = await prisma.product.update({
    where: { id },
    data: {
      ...(name && { name }), // Update name if provided
      ...(price && { price: parseFloat(price) }), // Update price if provided
      ...(stock && { stock: parseInt(stock) }), // Update stock if provided
    },
  });

  // Send a response with status 200 and the updated product data
  res.status(200).json(updateProduct);
});

// Function to delete a product by id
const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  // Extract product id from the request params
  const { id } = req.params;

  // Find the product by its id
  const findProduct = await prisma.product.findUnique({
    where: { id },
  });

  // If the product is not found, send status 404 and an error message
  if (!findProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Delete the product from the database using Prisma
  const deleteProduct = await prisma.product.delete({
    where: { id },
  });

  // Send a response with status 200 and the deleted product data
  res.status(200).json(deleteProduct);
});

// Function to get a product by its id
const getProductById = asyncHandler(async (req: Request, res: Response) => {
  // Extract product id from the request params
  const { id } = req.params;

  // Find the product by its id
  const findProduct = await prisma.product.findUnique({
    where: { id },
  });

  // If the product is not found, send status 404 and an error message
  if (!findProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Send a response with status 200 and the found product data
  res.status(200).json(findProduct);
});

// Function to get a list of products with pagination and filtering
const getProducts = asyncHandler(async (req: Request, res: Response) => {
  // Extract query parameters for pagination and filtering
  const { page = 1, limit = 10, name = "" } = req.query;

  // Convert page and limit to numbers
  const pageNumber = Number(page);
  const pageSize = Number(limit);

  // Ensure 'name' is a string
  const nameFilter = typeof name === "string" ? name : "";

  // Build filter condition based on the product name
  const filterCondition = nameFilter
    ? {
        name: {
          contains: nameFilter, // Filter products by name
          mode: "insensitive", // Case-insensitive filter
        },
      }
    : {};

  // Fetch products with pagination and filter
  const products = await prisma.product.findMany({
    where: filterCondition, // Apply filter if name is provided
    orderBy: {
      createdAt: "desc", // Sort products by creation date (newest first)
    },
    skip: (pageNumber - 1) * pageSize, // Skip products for previous pages
    take: pageSize, // Limit results to the page size
  });

  // Get the total product count for pagination metadata
  const totalProducts = await prisma.product.count({
    where: filterCondition,
  });

  // Send a response with status 200 and the products data along with pagination metadata
  res.status(200).json({
    currentPage: pageNumber,
    totalPages: Math.ceil(totalProducts / pageSize),
    totalProducts,
    products,
  });
});

// Export the functions for use in route handlers
export { createProduct, updateProduct, deleteProduct, getProductById, getProducts };
