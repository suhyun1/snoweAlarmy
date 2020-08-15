#  교내 공지사항 telegram 알림봇 🏫📬
채널 링크: t.me/snowenotice

### 동기
교내 중요한 공지(전공 신청, 복학 신청 공지 등)을 놓치지 않고 확인하고자 제작하였다.(졸업이 걸려있다...) 매번 공지 목록을 보기 위해 로그인을 해야 하는 번거로움도 해결하고자 했다.<br/>
뿐만 아니라 웹페이지 업데이트를 알려주는 알림봇은 응용할 분야가 많을 것 같아 이번 기회에 만들어보았다. 

### 기능 설명
- 해당 telegram 채널로 봇이 교내 커뮤니티 공식 게시판에 올라온 공지를 모아 오후 11시에 알림해준다.
- 학생들이 가장 많이 찾는 두 종류의 게시물을 모아 알림을 제공한다.
    - 기본 `공지사항` 게시판
    - 공모전, 국가 및 기업의 취업 관련 프로그램을 안내하는 `취업경력개발`게시판
- ~~30분 간격으로 게시물 목록을 읽어오면서, 이전에 저장한 데이터와 비교하여 업데이트된 경우 새로운 게시물에 대한 telegram 메시지를 전송한다.~~
- 원래 30분 간격으로 글 목록을 읽어오려 했으나, 하루 올라오는 게시글이 평균 5~10개 정도로 많지 않고 중요도가 높지 않기 때문에 하루에 한 번만 알림을 제공하기로 하였다.


### 사용 기술
- node.js v.10.15.2
- npm 모듈
    - node-telegram-bot-api
    - axios
- Github Actions

#### node-telegram-bot-api
메시지로 알람을 제공하기 위해 telegram을 사용하기로 하였다.<br/>
Telegram에서 bot을 생성하였고, 채널을 생성한 뒤 이 bot을 관리자로 설정하였다. <br/>
이 모듈을 이용해 알림bot이 해당 채널에 메시지를 보낼 수 있다.

#### axios
axios는 Promise기반의 http통신 javascript 라이브러리이다.<br/>
JSON 데이터를 자동으로 변환해주는 것과 오류 코드 4xx, 5xx의 error handling도 해준다는 점을 고려해 선택하였다. ([Axios와 node-fetch를 비교한 글](https://medium.com/@jeffrey.allen.lewis/http-requests-compared-why-axios-is-better-than-node-fetch-more-secure-can-handle-errors-better-39fde869a4a6)을 참고하였다)

#### Github Actions
서버 없이 스크립트가 주기적으로 실행되길 원했기 때문에 간단히 Github Actions를 사용하였다. <br>
Github Actions에서는 반복 스케쥴을 cron 표현식으로 설정할 수 있다.(cron 표현식은 UTC 기준으로, `0 14 * * *` 은 한국 시간 기준 23시에 수행한다는 것)

- workflow 
~~~
on:
  schedule:
    - cron: "0 14 * * *"
jobs:
  job:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js environment
      uses: actions/setup-node@v1.4.3
    - run: npm ci
    - run: npm run start
      env: 
        BOT_TOKEN: ${{ secrets.BOT_TOKEN }}  
~~~

<br/>

### 참고
- [Github Docs - Using Node.js with GitHub Actions](https://docs.github.com/en/actions/language-and-framework-guides/using-nodejs-with-github-actions)
    - 깃허브 docs에 있는 Node.js workflow template를 이용해 작성하였다
