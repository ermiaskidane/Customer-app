const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendDeleteEmail } = require("../emails/accounts");
const router = new express.Router();

// router.get("/test", (req, res) => {
//   res.send("From a new file");
// });

// ############# USER MODEL  #######################################
// for my understanding better to use with out async method
// app.post("/users", (req, res) => {
//   const user = new User(req.body);

//   user
//     .save()
//     .then(() => {
//       res.status(201).send(user);
//     })
//     .catch(e => {
//       res.status(400).send(e);
//     });
//     console.log(req.body);
//     res.send("testing!");
// });

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    // res.status(201).send(user);
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
    // if we use getPublicProfile like below to create an instance, replace to toJSON with it
    // to make simple as above
    // res.send({ user: user.getPublicProfile(), token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// TO WIPE OUT all the users token
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
  // try {
  //   const users = await User.find({});
  //   res.send(users);
  // } catch (e) {
  //   res.status(500).send(e);
  // }

  // to use this commented, delete the async, good to go then
  // User.find({})
  //   .then(users => {
  //     res.send(users);
  //   })
  //   .catch(e => {
  //     res.status(500).send(e);
  //   });
});

// // READ WITH ROUTE PARAMS
// // we dont need this route anymore b/c we have an access to the authenticated via "/users/me" route
// router.get("/users/:id", async (req, res) => {
//   // console.log(req.params);
//   const _id = req.params.id;

//   try {
//     const user = await User.findById(_id);

//     if (!user) {
//       return res.status(404).send();
//     }

//     res.send(user);
//   } catch (e) {
//     res.status(500).send();
//   }
//   // User.findById(_id)
//   //   .then(user => {
//   //     if (!user) {
//   //       return res.status(404).send();
//   //     }

//   //     res.send(user);
//   //   })
//   //   .catch(e => {
//   //     res.status(500).send();
//   //   });
// });

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every(update => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid updates" });
  }
  try {
    // const user = await User.findById(req.params.id);
    // user.name = "something"
    // if we choose to pic by id donot use req.user instead simply user[update]
    updates.forEach(update => {
      req.user[update] = req.body[update];
    });

    await req.user.save();
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true
    // });

    // if (!user) {
    //   return res.status(404).send();
    // }

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// router.delete("/users/:id", auth, async (req, res) => {
router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // no need to check b/c user have just login in auth middleware
    // otherwise we would if we choose with /users/:id router and in findByIdAndDelete(req.params.id)
    // if (!user) {
    //   return res.status(404).send();
    // }

    // in long run use the deleteOne method b/c this is deprected
    //  since deleteOne could not trigger the middleware in user models for delete user
    // we choose to use remove method
    await req.user.remove();
    sendDeleteEmail(req.user.email, req.user.name);
    // await req.user.deleteOne();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

const upload = multer({
  // dest: "avatars",
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("please upload a new jpg or png "));
    }

    cb(undefined, true);
  }
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 300 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    // req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
