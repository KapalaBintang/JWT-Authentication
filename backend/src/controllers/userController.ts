import { Request, Response } from "express"; // Import Request and Response types from Express
import prisma from "../config/prismaClient"; // Import prismaClient configuration to interact with the database
import asyncHandler from "../middlewares/asyncHandler"; // Import asyncHandler middleware to handle asynchronous errors

/**
 * Function to create a new user
 *
 * @param req - The request object that contains data from the request body
 * @param res - The response object used to send the response back to the client
 */
const createUser = asyncHandler(async (req: Request, res: Response) => {
  // Destructure the 'name' and 'password' from the request body
  const { name, password } = req.body;

  // Validate if 'name' or 'password' are missing from the request body
  if (!name || !password) {
    res.status(400); // Set response status to 400 (Bad Request)
    throw new Error("Please add all fields"); // Throw an error if any field is missing
  }

  // Check if a user with the same name already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      name, // Search for an existing user by 'name'
    },
  });

  // If a user with that name already exists, return an error
  if (existingUser) {
    res.status(400); // Set response status to 400 (Bad Request)
    throw new Error("User already exists"); // Throw an error if the user already exists
  }

  // Create a new user with the provided data
  const newUser = await prisma.user.create({
    data: {
      name, // Save the user's name
      password, // Save the user's password
      role: "cashier", // Set the default role as "cashier" for the new user
    },
  });

  // Send a response with status 201 (Created) and the newly created user's data
  res.status(201).json({
    id: newUser.id, // New user's ID
    name: newUser.name, // New user's name
    role: newUser.role, // New user's role
  });
});

export { createUser }; // Export the createUser function to be used in other parts of the application
