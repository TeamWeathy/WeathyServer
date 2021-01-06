const cryptoRandomString = require('crypto-random-string');
let generateToken = () => {
    return cryptoRandomString({ length: 30, type: 'alphanumeric' });
}

let getUserIdByToken = () => {
// TODO: sequalizer에서 token으로 user_id 가져오기 expired 되었는지도 확인
}

modules.export = {
    isValidToken: async (user_id, token) => {
        return getUserIdByToken(token) == user_id;
    },
    refreshTokenOfUser: async (user_id) => {
        let token = generateToken();
        // TODO: Sequalizer에서 Token 업데이트 하는 코드 추가
    }
};