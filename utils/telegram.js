const axios = require("axios")

// Debug environment variables
console.log("=== ENVIRONMENT DEBUG ===");
console.log("BOT_TOKEN exists:", !!process.env.BOT_TOKEN);
console.log("BOT_TOKEN length:", process.env.BOT_TOKEN ? process.env.BOT_TOKEN.length : 0);
console.log("CHAT_ID exists:", !!process.env.CHAT_ID);
console.log("========================");

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID

// Create one-time invite link
const createOneTimeInviteLink = async () => {
  try {
    const res = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/createChatInviteLink`, {
      chat_id: CHAT_ID,
      member_limit: 1, // faqat 1 kishi ishlata oladi
    })
    return res.data.result.invite_link
  } catch (err) {
    console.error("❌ Error creating invite link:", err.response?.data || err.message)
    throw new Error("Invite link yaratishda xatolik bo'ldi")
  }
}

// Send message (userga yuborish uchun) - improved version
const sendMessage = async (chatId, text) => {
  try {
    // Bot token ni har safar yangi olish
    const currentBotToken = process.env.BOT_TOKEN;
    
    if (!currentBotToken) {
      // Agar hali ham yo'q bo'lsa, dotenv ni qayta yuklash
      require('dotenv').config();
      const retryToken = process.env.BOT_TOKEN;
      
      if (!retryToken) {
        throw new Error("BOT_TOKEN environment variable is still not set after reload")
      }
    }

    const tokenToUse = currentBotToken || process.env.BOT_TOKEN;
    console.log(`📤 Sending message to chat_id: ${chatId} with token: ${tokenToUse.substring(0, 10)}...`)
    
    const response = await axios.post(`https://api.telegram.org/bot${tokenToUse}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    })
    
    console.log(`✅ Message sent successfully to: ${chatId}`)
    return response.data
    
  } catch (err) {
    const errorData = err.response?.data || err.message
    console.error(`❌ Error sending message to ${chatId}:`, errorData)
    
    // Xatolik turini aniqroq ko'rsatish
    if (err.response?.data?.error_code === 404) {
      console.error(`❌ Chat ${chatId} not found. User might not have started chat with bot.`)
    } else if (err.response?.data?.error_code === 403) {
      console.error(`❌ Bot blocked by user ${chatId}`)
    } else if (err.response?.data?.error_code === 400) {
      console.error(`❌ Bad request for user ${chatId}:`, err.response.data.description)
    }
    
    // Xatolikni qayta tashlash o'rniga, log qilib o'tamiz
    // throw new Error(`Xabar yuborishda xatolik: ${errorData}`)
    return { error: true, chatId, errorData }
  }
}

// Test bot connection
const testBotConnection = async () => {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`)
    console.log("✅ Bot connection successful:", response.data.result.username)
    return response.data.result
  } catch (err) {
    console.error("❌ Bot connection failed:", err.response?.data || err.message)
    throw new Error("Bot bilan bog'lanishda xatolik")
  }
}

module.exports = {
  createOneTimeInviteLink,
  sendMessage,
  testBotConnection,
}