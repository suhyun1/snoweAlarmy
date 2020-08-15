const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN);
const chatId = '@snowenotice';  //채널id

(async () => {
  const notice_res = await axios.default({
    method: "GET",
    url:
      "https://snowe.sookmyung.ac.kr/bbs5/messages/boardMessages?boardKey=1", 
    params: {
      sort: "sequence",
      order: "desc",
      rows: "20",
    },
  });
  const career_res = await axios.default({
    method: "GET",
    url:
      "https://snowe.sookmyung.ac.kr/bbs5/messages/boardMessages?boardKey=4", 
    params: {
      sort: "sequence",
      order: "desc",
      rows: "20",
    },
  });

  const notice = notice_res.data.page.list;
  const careerNotice = career_res.data.page.list;

  const nowTime = Date.parse(new Date());
  if (notice.length > 0) {
    let message = `💌오늘의 공지사항입니다.\n`;
    for (let i = 0; i < notice.length; i++) {
      if (nowTime - notice[i].registerDate < 86400000) 
        message += `👉${notice[i].title.trim()}\nhttps://snowe.sookmyung.ac.kr/bbs5/boards/notice/${notice[i].id}\n`;
    }
    await bot.sendMessage(chatId, message);
  }
  if (careerNotice.length > 0) {
    let message = `💌오늘의 취업경력개발 게시글입니다.\n`;
    for (let i = 0; i < careerNotice.length; i++) {
      if (nowTime - careerNotice[i].registerDate < 86400000) 
        message += `👉${careerNotice[i].title.trim()}\nhttps://snowe.sookmyung.ac.kr/bbs5/boards/jobcareer/${careerNotice[i].id}\n`;
    }
    await bot.sendMessage(chatId, message);
  }

   console.log("✅성공적으로 전송되었습니다.");
})().catch(e => {
    console.log(e)
});
