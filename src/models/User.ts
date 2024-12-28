import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Add a virtual `id` field
userSchema.virtual("id").get(function () {
  return this._id.toString();
});
userSchema.set("toJSON", { virtuals: true });


// Ensure virtuals are included in JSON and object outputs
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export const User = mongoose.model("User", userSchema);
