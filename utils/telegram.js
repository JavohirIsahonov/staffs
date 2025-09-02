const axios = require("axios");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Create one-time invite link
const createOneTimeInviteLink = async () => {
  try {
    const res = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/createChatInviteLink`,
      {
        chat_id: CHAT_ID,
        member_limit: 1, // faqat 1 kishi ishlata oladi
      }
    );
    return res.data.result.invite_link;
  } catch (err) {
    console.error("❌ Error creating invite link:", err.response?.data || err.message);
    throw new Error("Invite link yaratishda xatolik bo‘ldi");
  }
};

// Send message
const sendMessage = async (chatId, text) => {
  try {
    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: text,
        parse_mode: "HTML"
      }
    );
  } catch (err) {
    console.error("❌ Error sending message:", err.response?.data || err.message);
    throw new Error("Xabar yuborishda xatolik bo‘ldi");
  }
};

module.exports = {
  createOneTimeInviteLink,
  sendMessage
};
