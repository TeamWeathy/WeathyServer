const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const createError = require('http-errors');
const logger = require('winston');
const sc = require('./statusCode');
const exception = require('./exception');
aws.config.loadFromPath(__dirname + '/../config/s3.json');

const s3 = new aws.S3();

const uploadS3 = multer({
    storage: multerS3({
        s3,
        bucket: 'weathy',
        acl: 'public-read',
        key: function (req, file, cb) {
            if (file && req.body.weathy) {
                const weathy = JSON.parse(req.body.weathy);
                console.log(weathy.userId);
                if (!weathy.userId) {
                    console.log('Fuck');
                    throw exception.BAD_REQUEST;
                }
                cb(
                    null,
                    `ootd/${
                        weathy.userId
                    }/${Date.now()}.${file.originalname.split('.').pop()}`
                );
            }
        },
        onError: function (err, next) {
            logger.error(err.stack);
            next(createError(sc.BAD_REQUEST, 'File Error'));
        }
    })
});

module.exports = {
    upload: {
        single: async function (req, res, next) {
            console.log('hey');
            try {
                await uploadS3.single('img');
            } catch (err) {
                next(createError(sc.BAD_REQUEST, 'Invalid user id given'));
            }
        }
    }
};
