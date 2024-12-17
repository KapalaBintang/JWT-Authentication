import { Request, Response } from "express"; // Import Request and Response types from Express
import prisma from "../config/prismaClient"; // Import prismaClient configuration to interact with the database
import asyncHandler from "../middlewares/asyncHandler"; // Import asyncHandler middleware to handle asynchronous errors

const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, price, stock } = req.body;

  if (!name || !price || !stock) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  if (price < 0 || stock < 0) {
    res.status(400).json({
      message: "Stock and price must be greater or equal than 0",
    });
  }

  const newProduct = await prisma.product.create({
    data: {
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
    },
  });

  res.status(201).json(newProduct);
});

const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, price, stock } = req.body;
  const { id } = req.params;

  if (!id || !name || !price || !stock) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  if (price < 0 || stock < 0) {
    res.status(400).json({
      message: "Stock and price must be greater or equal than 0",
    });
  }

  const findProduct = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!findProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  const updateProduct = await prisma.product.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(price && { price: parseFloat(price) }),
      ...(stock && { stock: parseInt(stock) }),
    },
  });

  res.status(200).json(updateProduct);
});

const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const findProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!findProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  const deleteProduct = await prisma.product.delete({
    where: { id },
  });

  res.status(200).json(deleteProduct);
});

const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const findProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!findProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(findProduct);
});

const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, name = "" } = req.query;

  // Convert page and limit to integers
  const pageNumber = Number(page);
  const pageSize = Number(limit);

  // Ensure 'name' is a string
  const nameFilter = typeof name === "string" ? name : "";

  // Build filtering condition
  const filterCondition = nameFilter
    ? {
        name: {
          contains: nameFilter,
          mode: "insensitive",
        },
      }
    : {};

  // Fetch products with pagination and filtering
  const products = await prisma.product.findMany({
    where: filterCondition, // Apply filter only if name is provided
    orderBy: {
      createdAt: "desc", // Sort by newest first
    },
    skip: (pageNumber - 1) * pageSize, // Skip products for previous pages
    take: pageSize, // Limit results to the page size
  });

  // Get total count for pagination metadata
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

export { createProduct, updateProduct, deleteProduct, getProductById, getProducts };
