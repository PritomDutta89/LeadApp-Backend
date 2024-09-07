import express from "express";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

export const router = express.Router();

router.get("/posts", getPosts);
router.get("/posts/:id", getPostById);
router.post("/posts", createPost);
router.delete("/posts/:id", deletePost);