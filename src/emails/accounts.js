const sgMail = require("@sendgrid/mail");

// const sendgridApiKey =
//   "SG.2D_t7qbYRJab7_Ag.C9gnHBgX8rwxbH2rxoSptbw0nHc";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "hadeklte21@gmail.com",
    subject: "thanks for joining",
    text: `welcome to the app, ${name}. let us know how you get along  with the app.`
  });
};

const sendDeleteEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "hadeklte21@gmail.com",
    subject: "sorry to hear you are leaving",
    text:
      "sad to hear you are leaving, is ther anything we could have do to stay in the board."
  });
};
// note that using html could able to send images
// and a styled forms texts
// sgMail.send({
//   to: "hadeklte21@gmail.com",
//   from: "hadeklte21@gmail.com",
//   subject: "first creation",
//   text: "hopefully it will get to you",
// html: ""
// });

module.exports = {
  sendWelcomeEmail,
  sendDeleteEmail
};
