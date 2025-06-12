const contactModel = require("../Models/contactModel")
const { contactSchema } = require('/Campus Collab/Shared/contactSchema')

exports.contact = async (req, res) => {
    try {

        await contactSchema.validate(req.body, { abortEarly: false });
        // abortEarly is used to show all the errors at once

        const { name, email, subject, message } = req.body

        const newContact = await contactModel.create({
            name,
            email,
            subject,
            message
        })

        res.status(200).json({ message: "Thanks for contacting us , we will reach you soon", contact: newContact })
    }
    catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: error.errors }); // This will send all validation messages
        }
        console.log("Contacting error", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}