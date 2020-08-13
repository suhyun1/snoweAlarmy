const puppeteer = require('puppeteer');
const cron = require('node-cron');
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const chatId = '@snowenotice';  //채널id

const getFormatDate = async(date) => {
     const year = date.getFullYear();
     const month = 1 + date.getMonth();
     const day = date.getDate();
     console.log(`day:${day}`);
     return `${year.toString().substring(2, 4)}.${month >= 10 ? month : "0" + month}.${day >= 10 ? day : "0" + day}`;
}; //YY.MM.DD 형식

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://snowe.sookmyung.ac.kr/bbs5/users/login");

  await page.evaluate(
    (id, pw) => {
      document.querySelector("#userId").value = id;
      document.querySelector("#userPassword").value = pw;
    },
    process.env.USER_ID,
    process.env.USER_PW
  );

  await page.click("#loginButton");
  console.log("login success");

  //공지사항
  await page.goto("https://snowe.sookmyung.ac.kr/bbs5/boards/notice");
  await page.waitFor(3000);
  // today.setHours(today.getHours()+9);
  const notice = await page.evaluate(() => {
    let posts = [];
    const tbodyChilds = document.querySelector("#messageListBody").children;
    for (let i = 0; i < tbodyChilds.length; i++) {
      if (tbodyChilds[i].children.length !== 5) continue;
      posts.push({
        id: tbodyChilds[i].attributes[0].value.substring(3), //게시물 id
        title: tbodyChilds[i].children[2].textContent, //게시물 제목
        createdAt: tbodyChilds[i].children[4].textContent.substring(0, 8), //게시물 생성날짜
      });
    }
    return posts;
  });

  //취업관련 공지(별도 게시판에 존재함)
  await page.goto("https://snowe.sookmyung.ac.kr/bbs5/boards/jobcareer");
  await page.waitFor(3000);

  const careerNotice = await page.evaluate(() => {
    let posts = [];
    const tbodyChilds = document.querySelector("#messageListBody").children;
    for (let i = 0; i < tbodyChilds.length; i++) {
      if (tbodyChilds[i].children.length !== 5) continue;
      posts.push({
        id: tbodyChilds[i].attributes[0].value.substring(3), //게시물 id
        title: tbodyChilds[i].children[2].textContent, //게시물 제목
        createdAt: tbodyChilds[i].children[4].textContent.substring(0, 8), //게시물 생성날짜
      });
    }
    return posts;
  });
  console.log(careerNotice[0]);
  await browser.close();

  const todayDate = await getFormatDate(new Date());
  
  if (notice.length > 0) {
    let message = `💌오늘의 공지사항입니다.\n`;
    for (let i = 0; i < notice.length; i++) {
      if (notice[i].createdAt !== todayDate) continue;
      message += `👉${notice[i].title.trim()}\nhttps://snowe.sookmyung.ac.kr/bbs5/boards/notice/${notice[i].id}\n`;
    }
    await bot.sendMessage(chatId, message);
  }

  if (careerNotice.length > 0) {
    let message = `💌오늘의 취업경력개발 게시글입니다.\n`;
    for (let i = 0; i < careerNotice.length; i++) {
      if (careerNotice[i].createdAt !== todayDate) continue;
      message += `👉${careerNotice[i].title.trim()}\nhttps://snowe.sookmyung.ac.kr/bbs5/boards/jobcareer/${careerNotice[i].id}\n`;
    }
    await bot.sendMessage(chatId, message);
  }
})().catch((e) => {
  console.error(e.stack); 
});





