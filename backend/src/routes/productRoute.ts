import express from "express";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/productController";

const router = express.Router();

router.post("/", createProduct);

router.get("/getProducts", getProducts);

router.route("/:id").get(getProductById).put(updateProduct).delete(deleteProduct);

export default router;
