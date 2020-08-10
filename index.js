const puppeteer = require('puppeteer');
const cron = require('node-cron');
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

let prevPost = [];
let curPost = [];

const pushMessage = (chatId) => {
 
    const url = "https://snowe.sookmyung.ac.kr/bbs5/boards/notice/"+curPost[0].id;
    bot.sendMessage(chatId, `새로운 공지사항이 있습니다.\n${curPost[0].title}\n${url}`); 
}

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

    await page.goto("https://snowe.sookmyung.ac.kr/bbs5/boards/notice");
    await page.waitFor(3000);

    curPost = await page.evaluate(() => {
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

}

const job = new cron.schedule( "*/10 * 6-20 * * 1-5", function () {
      let today = new Date();
      console.log(today);
      prevPost = curPost;
      getNewPosts();
    if (prevPost.length > 0 && curPost[0].id !== prevPost[0].id) {
      pushMessage(chatId);
    }
  }, null, true, "Asia/Seoul"
);


const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
let running = false;
bot.on("message", (msg) => {
    if(!running){
        running = true;
        const chatId = msg.chat.id;
        bot.sendMessage(
          chatId,
          "지금부터 공지사항에 새 글이 올라오면 알려드립니다.\n월~금 6시~21시 30분 간격으로 업데이트를 확인합니다."
        );
        job.start();
    }
});





