const Message = require("../models/message.model");
const User = require("../models/user.model");
const { sendMessage } = require("../utils/telegram");

// Create and send message to all users
exports.createAndSendToAll = async (req, res) => {
  try {
    // Debug: req.body ni ko'rish uchun
    console.log("Received req.body:", req.body);
    
    // Validate request - React Quill dan kelgan HTML content ni tekshirish
    if (!req.body || (!req.body.message && !req.body.content)) {
      return res.status(400).send({
        message: "Message content can not be empty",
        receivedBody: req.body
      });
    }

    // React Quill dan kelgan HTML contentni olish
    const htmlContent = req.body.message || req.body.content;
    
    // HTML taglarni olib tashlash va formatlashni saqlash
    const plainTextContent = htmlContent
      .replace(/<\/p>/g, '\n\n')        // </p> taglarni ikkita yangi qator bilan almashtirish
      .replace(/<br\s*\/?>/gi, '\n')    // <br> taglarni yangi qator bilan almashtirish
      .replace(/<\/li>/g, '\n')         // </li> taglarni yangi qator bilan almashtirish
      .replace(/<li>/g, '• ')           // <li> taglarni bullet point bilan almashtirish
      .replace(/<\/h[1-6]>/g, '\n\n')   // Heading taglardan keyin ikkita yangi qator
      .replace(/<h[1-6][^>]*>/g, '')    // Heading ochilish taglarni olib tashlash
      .replace(/<[^>]*>/g, '')          // Qolgan barcha HTML taglarni olib tashlash
      .replace(/&nbsp;/g, ' ')          // &nbsp; ni oddiy probel bilan almashtirish
      .replace(/&lt;/g, '<')            // HTML entities ni decode qilish
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Bir nechta bo'sh qatorlarni ikkitaga kamaytirish
      .trim();

    // Agar plain text bo'sh bo'lsa
    if (!plainTextContent) {
      return res.status(400).send({
        message: "Message content is empty after removing HTML tags"
      });
    }

    console.log("HTML content:", htmlContent);
    console.log("Plain text content:", plainTextContent);

    // Create and save message to database (HTML versiyasini saqlash)
    const newMessage = new Message({
      message: htmlContent, // HTML formatda saqlash
    });

    const savedMessage = await newMessage.save();

    // Get all users
    const users = await User.find({});

    // Send message to all users
    let successCount = 0;
    let failCount = 0;
    const results = [];

    for (const user of users) {
      if (user.telegram_id) {
        // Telegram uchun plain text jo'natish
        const result = await sendMessage(user.telegram_id, plainTextContent);
        if (result.error) {
          failCount++;
          results.push({
            user_id: user._id,
            telegram_id: user.telegram_id,
            full_name: user.full_name,
            status: 'failed',
            error: result.errorData
          });
        } else {
          successCount++;
          results.push({
            user_id: user._id,
            telegram_id: user.telegram_id,
            full_name: user.full_name,
            status: 'success'
          });
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
      plainTextSent: plainTextContent // Debug uchun
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