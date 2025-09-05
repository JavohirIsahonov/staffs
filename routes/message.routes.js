const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const upload = require("../utils/upload");

// POST - Create message with image
router.post("/send-to-all", upload.single("image"), messageController.createAndSendToAll);

// GET - Get all messages
router.get("/", messageController.getAllMessages);

// DELETE - Delete a message
router.delete("/:messageId", messageController.deleteMessage);

router.get("/test-bot", async (req, res) => {
  try {
    const { testBotConnection } = require("../utils/telegram");
    const botInfo = await testBotConnection();
    res.send({ success: true, bot: botInfo });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
});

module.exports = router;
