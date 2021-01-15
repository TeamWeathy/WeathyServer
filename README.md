# WeathyServer

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-blue.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## 나에게 돌아오는 맞춤 서비스, Weathy 🌤
<img src="https://imgur.com/IeuvIFO.png" width="750">

## Contributors ✨

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/yxxshin"><img src="https://avatars0.githubusercontent.com/u/63148508?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yeon Sang Shin</b></sub></a><br /><a href="https://github.com/TeamWeathy/WeathyServer/commits?author=yxxshin" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/seonuk"><img src="https://avatars3.githubusercontent.com/u/22928068?v=4?s=100" width="100px;" alt=""/><br /><sub><b>seonuk</b></sub></a><br /><a href="https://github.com/TeamWeathy/WeathyServer/commits?author=seonuk" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/dshyun0226"><img src="https://avatars3.githubusercontent.com/u/8098698?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jahyun Kim</b></sub></a><br /><a href="https://github.com/TeamWeathy/WeathyServer/commits?author=dshyun0226" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

### dependencies module (package.json)
#### Dev module: 
```json
  "devDependencies": {
    "decache": "^4.6.0",
    "eslint": "^7.16.0",
    "eslint-config-prettier": "^7.1.0",
    "eslint-plugin-prettier": "^3.3.0",
    "mocha": "^8.2.1",
    "prettier": "2.2.1",
    "swagger-jsdoc": "^6.0.0",
    "swagger-ui-express": "^4.1.6"
  }
```

#### module:
```json
  "dependencies": {
    "app-root-path": "^3.0.0",
    "cookie-parser": "~1.4.4",
    "crypto-random-string": "^3.3.0",
    "dayjs": "^1.10.2",
    "debug": "~2.6.9",
    "express": "~4.16.1",
    "http-errors": "~1.6.3",
    "jade": "~1.11.0",
    "morgan": "~1.9.1",
    "mysql2": "^2.2.5",
    "request": "^2.88.2",
    "request-promise": "^4.2.6",
    "sequelize": "^6.3.5",
    "sequelize-cli": "^6.2.0",
    "winston": "^3.3.3",
    "winston-daily-rotate-file": "^4.5.0"
  }
```

### ER Diagram
<img src=https://imgur.com/fIjtbo3.png width="550">


### 서버 아키텍쳐
<img src=https://imgur.com/EN9EiqB.png width="750">


### 핵심 기능 설명
Open weather api 를 사용하여 날씨를 수집하고, 해당 날씨에 사용자 의상 착의를 기록하여 사용자에게 날씨 맞춤 의상을 추천해준다.

### 팀별 역할 분담
- 신연상 : API 위키 문서 관리, Login, User, CLothes API 개발 및 테스트코드 작성
- 최선욱 : Open Weather Batch 프로그램 개발, Weathy API 개발 및 테스트코드 작성
- 김자현 : 스키마 설계, DB 권한 및 계정 , Calendar, Weather API 개발 및 테스트코드 작성  
이외의 API 설계, 코드 리뷰 등은 함께 하였음!

