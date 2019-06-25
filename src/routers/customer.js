const express = require("express");
const auth = require("../middleware/auth");
const Customer = require("../models/customer");
const router = new express.Router();

// ############ CUSTOMER MODEL ##########################
router.post("/customers", auth, async (req, res) => {
  // const customer = new Customer(req.body);
  const customer = new Customer({
    ...req.body,
    owner: req.user._id
  });

  try {
    await customer.save();
    res.status(201).send(customer);
  } catch (e) {
    res.status(400).send(e);
  }
  // customer
  //   .save()
  //   .then(() => {
  //     res.status(201).send(customer);
  //   })
  //   .catch(e => {
  //     res.status(400).send(e);
  //   });
});

// QUERY STRING GET /customers?completed=true
// pagination GET /customers?limit=2&skip=10
// sort GET  /customers?sortBy=createdAt:desc
router.get("/customers", auth, async (req, res) => {
  const matches = {};
  const sort = {};
  if (req.query.completed) {
    matches.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    // const customer = await Customer.find({});
    // const customer = await Customer.find({owner: req.user._id}); OR
    // this line of code grap the info from the userSchema.virtual in user model
    // await req.user.populate("customers").execPopulate();
    await req.user
      .populate({
        path: "customers",
        match: matches,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      })
      .execPopulate();
    // if query string is not provided mongoose will ingore it and provide all of them.
    // with Find method
    // await Task.find({ owner: req.user._id, ...match }, null,  { skip: 10, limit: 10 })
    res.send(req.user.customers);
  } catch (e) {
    res.status(500).send(e);
  }
  // Customer.find({})
  //   .then(customer => {
  //     res.send(customer);
  //   })
  //   .catch(e => {
  //     res.status(500).send(e);
  //   });
});

// read by the name field
router.get("/customers/:id", auth, async (req, res) => {
  const _id = req.params.id;
  // console.log(name);

  try {
    const username = await Customer.findOne({
      _id,
      owner: req.user._id
    });
    // const username = await Customer.findOne({
    //   name: name
    // });
    if (!username) {
      return res.status(404).send();
    }
    res.send(username);
  } catch (e) {
    res.status(500).send(e);
  }
  // Customer.findOne({ name: name })
  //   .then(customer => {
  //     if (!customer) {
  //       return res.status(404).send();
  //     }
  //     res.send(customer);
  //   })
  //   .catch(e => {
  //     res.status(500).send(e);
  //   });
});

router.patch("/customers/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "item", "quantity"];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid updates!" });
  }

  try {
    // const customer = await Customer.findById(req.params.id); before auth
    const customer = await Customer.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!customer) {
      return res.status(404).send();
    }

    updates.forEach(update => {
      customer[update] = req.body[update];
    });

    await customer.save();
    // const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true
    // });

    res.send(customer);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/customers/:id", auth, async (req, res) => {
  try {
    // const customer = await Customer.findByIdAndDelete(req.params.id); works for all users
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!customer) {
      return res.status(404).send();
    }

    res.send(customer);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
