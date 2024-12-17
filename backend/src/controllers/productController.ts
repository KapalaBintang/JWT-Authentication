import { Request, Response } from "express";
import prisma from "../config/prismaClient";
import asyncHandler from "../middlewares/asyncHandler";
import { start } from "repl";

// Function to create a new product
const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, price, stock } = req.body;

  if (!name || price === undefined || stock === undefined) {
    res.status(400);
    throw new Error("Please add all fields: name, price, and stock");
  }

  const parsedPrice = parseFloat(price);
  const parsedStock = parseInt(stock);

  if (isNaN(parsedPrice) || isNaN(parsedStock)) {
    res.status(400);
    throw new Error("Price and stock must be valid numbers");
  }

  if (parsedPrice < 0 || parsedStock < 0) {
    res.status(400);
    throw new Error("Stock and price must be greater or equal to 0");
  }

  const newProduct = await prisma.product.create({
    data: {
      name,
      price: parsedPrice,
      stock: parsedStock,
    },
  });

  res.status(201).json(newProduct);
});

// Function to update an existing product
const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // Tidak perlu parse
  const { name, price, stock } = req.body;

  if (!name || price === undefined || stock === undefined) {
    res.status(400);
    throw new Error("Please add all fields: name, price, and stock");
  }

  const parsedPrice = parseFloat(price);
  const parsedStock = parseInt(stock);

  if (isNaN(parsedPrice) || isNaN(parsedStock)) {
    res.status(400);
    throw new Error("Price and stock must be valid numbers");
  }

  if (parsedPrice < 0 || parsedStock < 0) {
    res.status(400);
    throw new Error("Stock and price must be greater or equal to 0");
  }

  const findProduct = await prisma.product.findUnique({
    where: { id }, // Prisma akan menerima string yang dikonversi otomatis
  });

  if (!findProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      name,
      price: parsedPrice,
      stock: parsedStock,
    },
  });

  res.status(200).json(updatedProduct);
});

// Function to delete a product
const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const findProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!findProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  await prisma.product.delete({
    where: { id },
  });

  res.status(200).json({ message: "Product deleted successfully" });
});

// Function to get a product by ID
const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const findProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!findProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(200).json(findProduct);
});

// Function to get all products with pagination and filtering
const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, name = "" } = req.query;

  const pageNumber = parseInt(page as string) || 1;
  const pageSize = parseInt(limit as string) || 10;

  if (pageNumber < 1 || pageSize < 1) {
    res.status(400);
    throw new Error("Page and limit must be positive integers");
  }

  const nameFilter = typeof name === "string" ? name : "";

  const filterCondition = nameFilter
    ? {
        name: {
          contains: nameFilter,
        },
      }
    : {};

  const products = await prisma.product.findMany({
    where: filterCondition,
    orderBy: {
      createdAt: "desc",
    },
    skip: (pageNumber - 1) * pageSize,
    take: pageSize,
  });

  const totalProducts = await prisma.product.count({
    where: filterCondition,
  });

  res.status(200).json({
    currentPage: pageNumber,
    totalPages: Math.ceil(totalProducts / pageSize),
    totalProducts,
    products,
  });
});

// Export the functions
export { createProduct, updateProduct, deleteProduct, getProductById, getProducts };
