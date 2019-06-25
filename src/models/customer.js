const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String
    },
    item: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    quantity: {
      type: Number,
      default: 2,
      required: true,
      trim: true,
      validate(value) {
        if (value < 0) {
          throw new Error(" Quantity can not be negative");
        }
      }
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

// customerSchema.pre("save", async function(next) {
//   const customer = this;
//   if (customer.isModified("quantity")) {
//     customer.quantity = await bcrypt.hash(user.quantity, 8);
//   }
//   next();
// });
const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
