const TelegramBot = require("node-telegram-bot-api");
const parsePosts = require("./parsePosts");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN);
const chatId = "@snowenotice"; //채널id

(async () => {
  const notices = await parsePosts(1); //1번 게시판(공지사항)
  const jobCareerPosts = await parsePosts(4); //4번 게시판(취업경력개발)

  if (notices.length > 0) {
    let message = `📬오늘의 공지사항입니다.\n`;
    notices.forEach((post) => {
      message += `👉${post.title}\nhttps://snowe.sookmyung.ac.kr/bbs5/boards/notice/${post.id}\n`;
    });
    await bot.sendMessage(chatId, `${message}`);
  } else {
    await bot.sendMessage(chatId, `❎오늘은 공지사항이 없습니다.`);
  }

  if (jobCareerPosts.length > 0) {
    let message = `📬오늘의 취업경력개발 게시글입니다.\n`;
    jobCareerPosts.forEach((post) => {
      message += `👉${post.title}\nhttps://snowe.sookmyung.ac.kr/bbs5/boards/jobcareer/${post.id}\n`;
    });
    await bot.sendMessage(chatId, `${message}`);
  } else {
    await bot.sendMessage(chatId, `❎오늘은 취업경력개발 게시글이 없습니다.`);
  }
})().catch((e) => {
  console.log(e);
});
