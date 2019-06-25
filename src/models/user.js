const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("./customer");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("password can not contain 'password' ");
        }
      }
    },
    age: {
      type: Number,
      default: 1,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be positive number");
        }
      }
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    avatar: {
      type: Buffer
    }
  },
  {
    timestamps: true
  }
);

// relationship b/n models not stored in database as a tokens array
// or the owner stored in customer models
userSchema.virtual("customers", {
  ref: "Customer",
  localField: "_id",
  foreignField: "owner"
});

// TO HIDE THE PASSWORD AND TOKEN
// or we can use getPublicProfile to tojson along the respond in
//  users/login router
userSchema.methods.toJSON = function() {
  const user = this;
  // this is the row data fields
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  // add token to array
  user.tokens = user.tokens.concat({ token: token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error("unable to login");
  }

  // console.log(password);

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("unable to login");
  }

  return user;
};

// Hash the plain text password before saving
userSchema.pre("save", async function(next) {
  const user = this;
  // console.log("just before saving!");
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  // if (user.isModified("name")) {
  //   user.name = await bcrypt.hash(user.name, 8);
  // }
  next();
});

// delete users customer when user is removed
userSchema.pre("remove", async function(next) {
  const user = this;
  await Customer.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

// // CREATE AN INSTANCE
// const ermias = new User({
//   name: "  Ermias   ",
//   email: "ERMIAS@YAHOO.COM  ",
//   password: "test1234"
// });

// ermias
//   .save()
//   .then(ermias => {
//     console.log(ermias);
//   })
//   .catch(e => {
//     console.log("Error!", e);
//   });

module.exports = User;
