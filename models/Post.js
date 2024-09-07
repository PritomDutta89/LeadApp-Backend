import mongoose from "mongoose";

export const PostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  product: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postModel = mongoose.models.post || mongoose.model("post", PostSchema);

export default postModel;
