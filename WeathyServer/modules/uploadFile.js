const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const createError = require('http-errors');
const logger = require('winston');
const sc = require('./statusCode');
const exception = require('./exception');

aws.config.loadFromPath(__dirname + '/../config/s3.json');

const s3 = new aws.S3();

const uploadS3 = (userId, file) => {
    const param = {
        Bucket: 'weathy',
        Key: `ootd/${userId}/${Date.now()}.jpeg`,
        ACL: 'public-read',
        Body: file,
        ContentType: 'image/jpeg'
    };

    return new Promise((res, rej) => {
        s3.upload(param, function (err, data) {
            if (err) {
                logger.error(err);
                rej(Error(exception.SERVER_ERROR));
            } else {
                res(data.Location);
            }
        });
    });
};

module.exports = {
    uploadS3
};
