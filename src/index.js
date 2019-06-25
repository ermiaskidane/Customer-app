const express = require("express");
require("./db/mongoose");
// const User = require("./models/user");
// const Customer = require("./models/customer");
const userRouter = require("./routers/user");
const customerRouter = require("./routers/customer");

const app = express();
const port = process.env.PORT;
// const port = process.env.PORT || 3000;

// express middleware
// app.use((req, res, next) => {
//   if (req.method === "GET") {
//     res.send("GET requests are disabled");
//   } else {
//     next();
//   }
//   // console.log(req.method, res.path);
//   // next();
// });

// Setup middleware for maintenance mode
// app.use((req, res, next) => {
//   res.status(503).send("Site is currently down. check back soon!");
// });

// customize server, change in coming json to an object js to access in our request
app.use(express.json());
app.use(userRouter);
app.use(customerRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

// example for bcrypt hash
const bcrypt = require("bcryptjs");

// const myFunction = async () => {
//   const password = "White1234?";
//   const hashedPassword = await bcrypt.hash(password, 8);

//   console.log(password);
//   console.log(hashedPassword);

//   const isMatch = await bcrypt.compare("White1234?", hashedPassword);
//   console.log(isMatch);
// };

// myFunction();

// example for json web token
// const jwt = require("jsonwebtoken");

// const jwtFunction = async () => {
//   const token = jwt.sign({ _id: "abc123?" }, "thisismynewcourse", {
//     expiresIn: "7 days"
//   });
//   console.log(token);

//   const data = jwt.verify(token, "thisismynewcourse");
//   console.log(data);
// };

// jwtFunction();

// ######################### how the toJSON works ###################

// const pet = {
//   name: "Hal"
// };

// pet.toJSON = function() {
//   // console.log(this);
//   // return this;
//   return {};
// };
// console.log(JSON.stringify(pet));

// USERS/CUSTOMERS models relation
// const Customer = require("./models/customer");
// const User = require("./models/user");

// const main = async () => {
//   // graping documents from user via customer _id, dont forget to change the id
//   //
//   // const customer = await Customer.findById("5d04e1c5acaf56552c438645");
//   // await customer.populate("owner").execPopulate();
//   // console.log(customer.owner);
//   //
//   //  graping documents from customer via user _id, dont forget to change the id
//   const user = await User.findById("5d04e181acaf56552c438642");
//   await user.populate("customers").execPopulate();
//   console.log(user.customers);
// };

// main();

// ######################### file uploads example ###################
const multer = require("multer");
const upload = multer({
  dest: "images",
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(doc|docx)$/)) {
      return cb(new Error("Please upload a word documents"));
    }
    // if (!file.originalname.endsWith(".pdf")) {
    //   return cb(new Error("Please upload a PDF"));
    // }

    cb(undefined, true);
    // cb(new Error("file must be a PDF"))
    // cb(undefined, true)
    // cb(undefined, false)
  }
});

const errorMiddleware = (req, res, next) => {
  throw new Error("from my middleware");
};
app.post(
  "/upload",
  upload.single("uploadImage"),
  (req, res) => {
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
