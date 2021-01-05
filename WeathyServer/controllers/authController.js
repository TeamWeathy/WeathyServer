const statusCode = require('../modules/statusCode');

module.exports = {
    login: (req, res) => {
        const { uuid } = req.body;
        let user;
        try {
            user = await userService.getUserByAccount(uuid);
        } catch (error) {
            return res.status(statusCode.INVALID_ACCOUNT);
        }

        let token = await tokenService.refreshTokenOfUser(user_id);
        return res.status(statusCode.OK).json({
            "user": user,
            "token": token,
            "message": "로그인 성공"
        });
    }
};