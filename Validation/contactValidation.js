const Yup = require("yup");

const contactSchema = Yup.object().shape({
 name: Yup.string().trim().required("Please enter your name").min(3, "Username should be min of 3 characters").max(20, "Username should me max of 20 characters"),

 email: Yup.string().trim().email("Invalid Email").required("Email is required"),

 subject: Yup.string().trim().required("Please enter a subject"),

 message: Yup.string().trim().required("Please enter your message").min(10, "Message cannot be less than 10 characters"),
});

module.exports = contactSchema;
