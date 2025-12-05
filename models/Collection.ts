import mongoose from "mongoose";

const RequestItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  method: { type: String, default: "GET" },
  url: { type: String },
  headers: { type: Array, default: [] },
  body: { type: String },
  bodyType: { type: String, default: "none" },
});

const CollectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  requests: [RequestItemSchema],
}, { timestamps: true });

export default mongoose.models.Collection || mongoose.model("Collection", CollectionSchema);