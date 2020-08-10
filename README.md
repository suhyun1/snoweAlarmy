# 교내 공지사항 telegram 알림봇

### 동기
매우 중요한 공지(전공 신청, 복학 신청 공지 등)을 놓치지 않기 위해 제작하였다.(졸업이 걸려있다...) 매번 공지를 보기 위해 로그인을 해야 하는 번거로움도 해결하고자 했다.<br/>
뿐만 아니라 **웹페이지 업데이트를 알려주는 알림봇은** 응용할 분야가 많을 것 같아 이번 기회에 만들었다. 

### 기능 설명(사용 설명)
- 해당 봇으로 먼저 아무 말이나 걸어야 그 시점부터 알림을 해주기 시작한다.
- 공지사항은 로그인해야 읽을 수 있다. 따라서 환경변수 USER_ID, USER_PW에 아이디와 비밀번호를 저장해두어야 한다.
- 30분 간격으로 게시물 목록을 읽어오면서, 이전에 저장한 데이터와 비교하여 업데이트된 경우 새로운 게시물에 대한 telegram 메시지를 전송한다.
- 학교 서버의 부하를 줄이기 위해 30분에 한번씩 수행하도록 하였다. 또한 교직원들이 일하지 않는 밤 시간과 주말은 수행하지 않도록 하였다.


### 사용 기술
- nodejs v.10.15.2
- npm 모듈
 - node-cron : task 스케쥴러(GNU crontab 기반)
 - node-telegram-bot-api
 - puppeteer
 - dotenv

#### puppeteer

실제로 브라우저 창을 띄우지 않고 백그라운드에서 가상으로 진행됨<br/>
특정 페이지에 접속하고 렌더링 되는 과정 후 데이터를 수집할 수 있어 선택함

#### node-cron

async와 await을 사용하는 스크래핑 프로그램이므로 비동기적으로 실행되는 setTimeout()이나 setInterval() 이용하면 실행 순서 예측이 어려울 것이라 생각<br/>
따라서 자바스크립트의 가벼운 스케쥴러 node-cron 이용<br/>
- 사용한 크론표현식
~~~
* */30 6-20 * * 1-5 
//월요일~금요일 오전 6시부터 오후 9시까지 30분 간격으로 수행
~~~

