const axios = require("axios");

const parsePosts = async (boardKey) => {
  const response = await axios.default({
    method: "GET",
    url: `https://snowe.sookmyung.ac.kr/bbs5/messages/boardMessages?boardKey=${boardKey}`,
    params: {
      sort: "sequence",
      order: "desc",
      rows: "30",
    },
  });
  if (response.data.page === undefined) throw new Error("요청 실패");
  const data = response.data.page.list;
  const nowTime = Date.parse(new Date());
  const posts = [];
  data.forEach((item) => {
    //24시간 안에 올라온 데이터만 저장
    if (nowTime - item.registerDate < 24 * 60 * 60 * 1000) {
      const post = {
        id: item.messageKey,
        title: item.title.trim(),
      };
      posts.push(post);
    }
  });
  console.log(`게시판${boardKey} 파싱 완료`);
  return posts;
};

module.exports = parsePosts;
