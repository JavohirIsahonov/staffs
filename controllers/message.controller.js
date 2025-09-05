const Message = require("../models/message.model");
const User = require("../models/user.model");
const { sendMessage } = require("../utils/telegram");

// Create and send message to all users
// Create and send message to all users
exports.createAndSendToAll = async (req, res) => {
  try {
    console.log("Received req.body:", req.body);
    console.log("Received file:", req.file);

    if (!req.body || (!req.body.message && !req.body.content)) {
      return res.status(400).send({
        message: "Message content can not be empty",
        receivedBody: req.body,
      });
    }

    const htmlContent = req.body.message || req.body.content;

    const plainTextContent = htmlContent
      .replace(/<\/p>/g, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/li>/g, "\n")
      .replace(/<li>/g, "• ")
      .replace(/<\/h[1-6]>/g, "\n\n")
      .replace(/<h[1-6][^>]*>/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();

    // Agar image kelgan bo‘lsa
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`; // static serve qilamiz
    }

    const newMessage = new Message({
      message: htmlContent,
      image: imagePath, // modelga qo‘shish kerak
    });

    const savedMessage = await newMessage.save();

    // Usersni olib kelib message yuborish
    const users = await User.find({});
    let successCount = 0;
    let failCount = 0;
    const results = [];

    for (const user of users) {
      if (user.telegram_id) {
        const result = await sendMessage(user.telegram_id, plainTextContent);
        if (result.error) {
          failCount++;
          results.push({ user_id: user._id, status: "failed" });
        } else {
          successCount++;
          results.push({ user_id: user._id, status: "success" });
        }
      }
    }

    res.status(201).send({
      message: "Message sending completed!",
      data: savedMessage,
      totalUsers: users.length,
      successCount,
      failCount,
      results,
      plainTextSent: plainTextContent,
      uploadedImage: imagePath,
    });
  } catch (err) {
    console.error("Error creating and sending message:", err);
    res.status(500).send({
      message: err.message || "Some error occurred while creating and sending message.",
    });
  }
};


// Get all messages
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.send(messages);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving messages.",
    });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  const id = req.params.messageId;

  try {
    const data = await Message.findByIdAndDelete(id);
    if (!data) {
      return res.status(404).send({
        message: "Message not found with id " + id,
      });
    }
    res.send({ message: "Message deleted successfully!" });
  } catch (err) {
    if (err.kind === "ObjectId" || err.name === "NotFound") {
      return res.status(404).send({
        message: "Message not found with id " + id,
      });
    }
    return res.status(500).send({
      message: "Could not delete message with id " + id,
    });
  }
};