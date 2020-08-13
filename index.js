const puppeteer = require('puppeteer');
const cron = require('node-cron');
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const chatId = '@snowenotice';  //채널id

let preNotice = [];
let curNotice = [];
let preCareerNotice = [];
let curCareerNotice = [];

// const pushMessage = (chatId) => {

//     const url = "https://snowe.sookmyung.ac.kr/bbs5/boards/notice/"+curNotice[0].id;
//     bot.sendMessage(chatId, `새로운 공지사항이 있습니다.\n${curNotice[0].title}\n${url}`); 
// }

const getNewPosts = async() => {

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

    curNotice = await page.evaluate(() => {
      const tbodyChilds = document.querySelector("#messageListBody").children; 
      let posts = [];
      for (let i = 0; i < tbodyChilds.length; i++) {
        if (tbodyChilds[i].children.length != 5) continue;
        posts.push({
          id: tbodyChilds[i].attributes[0].value.substring(3),  //게시물 id
          title: tbodyChilds[i].children[2].textContent,        //게시물 제목
        });
      }
      return posts;
    });

    //취업관련 공지(별도 게시판에 존재함)
    await page.goto("https://snowe.sookmyung.ac.kr/bbs5/boards/jobcareer");
    await page.waitFor(3000);

    curCareerNotice = await page.evaluate(() => {
      const tbodyChilds = document.querySelector("#messageListBody").children; 
      let posts = [];
      for (let i = 0; i < tbodyChilds.length; i++) {
        if (tbodyChilds[i].children.length != 5) continue;
        posts.push({
          id: tbodyChilds[i].attributes[0].value.substring(3),  //게시물 id
          title: tbodyChilds[i].children[2].textContent,        //게시물 제목
        });
      }
      return posts;
    });

    await browser.close();

    if (preNotice.length > 0 && curNotice[0].id !== preNotice[0].id) {
      console.log("notice update!");
      const url = "https://snowe.sookmyung.ac.kr/bbs5/boards/notice/" + curNotice[0].id;
      const title = curNotice[0].title;
      bot.sendMessage(chatId, `새로운 공지사항이 있습니다.\n${title}\n${url}`); 
      // pushMessage(chatId);
    }

    if (preCareerNotice.length > 0 && curCareerNotice[0].id !== preCareerNotice[0].id) {
      console.log("career notice update!");
      const url = "https://snowe.sookmyung.ac.kr/bbs5/boards/jobcareer/" + curCareerNotice[0].id;
      const title = curCareerNotice[0].title;
      bot.sendMessage(chatId, `새로운 취업경력개발 게시물이 있습니다.\n${title}\n${url}`); 
      // pushMessage(chatId);
    }
}

const job = new cron.schedule( "*/30 6-20 * * 1-5", function () {
      let today = new Date();
      console.log(today);
      preNotice = curNotice;
      preCareerNotice = curCareerNotice;
      getNewPosts();
  }, null, true, "Asia/Seoul"
);


bot.sendMessage(
  chatId,
  "공지사항에 새 글이 올라오면 알려드립니다.\n월~금 6시~21시 30분 간격으로 업데이트를 확인합니다."
);
job.start();





