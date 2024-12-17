import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// import routes
import userRoute from "./routes/userRoute";
import productRoute from "./routes/productRoute";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/user", userRoute);
app.use("/api/product", productRoute);

app.listen(process.env.PORT, () => {
  console.log("Example app listening on port " + process.env.PORT);
});
