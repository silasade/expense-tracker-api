import express from "express";
import dotenv from "dotenv";
import { createApp } from "./app";
import { connectDb } from "./config/db";
dotenv.config();

const port = process.env.PORT;

const startServer = async () => {
  await connectDb();
  const app = createApp();
  app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
  });
};

startServer().catch((error) => {
  console.log("Server failed to start", error);
  process.exit(1);
});
