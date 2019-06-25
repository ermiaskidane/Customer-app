const mongoose = require("mongoose");
// const validator = require("validator");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});

// const User = mongoose.model("User", {
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     trim: true,
//     lowercase: true,
//     validate(value) {
//       if (!validator.isEmail(value)) {
//         throw new Error("Email is invalid");
//       }
//     }
//   },
//   password: {
//     type: String,
//     required: true,
//     trim: true,
//     minlength: 7,
//     validate(value) {
//       if (value.toLowerCase().includes("password")) {
//         throw new Error("password can not contain 'password' ");
//       }
//     }
//   },
//   age: {
//     type: Number,
//     default: 1,
//     validate(value) {
//       if (value < 0) {
//         throw new Error("Age must be positive number");
//       }
//     }
//   }
// });

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

// const Task = mongoose.model("Task", {
//   description: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   completed: {
//     type: Boolean,
//     default: false
//   }
// });

// const newTask = new Task({
//   description: "make another example",
//   completed: true
// });

// newTask
//   .save()
//   .then(() => {
//     console.log(newTask);
//   })
//   .catch(e => {
//     console.log(e);
//   });
