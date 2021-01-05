# WeathyServer
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-blue.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
☀️웨디 서버파트

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
- `decache`: v 4.6.0  
- `eslint`: v 7.16.0
- `eslint-config-prettier`: v 7.1.0
- `eslint-plugin-prettier`: v 3.3.0
- `mocha`: v 8.2.1
- `prettier`:v 2.2.1
- `swagger-jsdoc`: v 6.0.0
- `swagger-ui-express`: v 4.1.6"

#### module:
- `app-root-path`: "^3.0.0",
- `cookie-parser`: "~1.4.4",
- `debug`: "~2.6.9",
- `express`: "~4.16.1",
- `http-errors`: "~1.6.3",
- `jade`: "~1.11.0",
- `morgan`: "~1.9.1",
- `mysql2`: "^2.2.5",
- `node-schedule`: "^1.3.2",
- `request-promise`: "^4.2.6",
- `sequelize`: "^6.3.5",
- `sequelize-cli`: "^6.2.0",
- `winston`: "^3.3.3",
- `winston-daily-rotate-file`: "^4.5.0"

### ER Diagram
![image](https://user-images.githubusercontent.com/22928068/103475327-a4108280-4def-11eb-8d7b-0063b61ebb7b.png)


### 서버 아키텍쳐
<img width="1282" alt="스크린샷 2021-01-03 오후 6 13 24" src="https://user-images.githubusercontent.com/22928068/103475300-601d7d80-4def-11eb-98c9-c04ab3d90770.png">


### 핵심 기능 설명
Open weather api 를 사용하여 날씨를 수집하고, 해당 날씨에 사용자 의상 착의를 기록하여 사용자에게 날씨 맞춤 의상을 추천해준다.

### 팀별 역할 분담
- 신연상 : 리드 개발, api 문서 관리 및 api 개발
- 최선욱 : open weather batch 프로그램 개발
- 김자현 : 전반적인 DB 관리 및 api 개발

