const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatarColor: { type: String, default: "#FF6B4A" },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatarColor: this.avatarColor,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", UserSchema);
