const assert = require('assert');
const decache = require('decache');
const { transports } = require('winston');
let logger = require('../../modules/logger');

function writeAllLevelLog(log) {
    logger.verbose(log);
    logger.info(log);
    logger.debug(log);
    logger.warn(log);
    logger.error(log);
}

describe('logger test', function () {
    let prev_node_env = process.env.NODE_ENV;
    beforeEach('init cache', () => {
        decache('../../modules/logger');
        logger = require('../../modules/logger');
    });
    describe('production mode test', () => {
        let prev_node_env = process.env.NODE_ENV;
        before('set NODE_ENV to production', () => {
            process.env.NODE_ENV = 'production';
        });
        after('reset NODE_ENV', () => {
            process.env.NODE_ENV = prev_node_env;
        });
        it('production mode not logs to console', () => {
            for (let i = 0; i < logger.transports.length; ++i) {
                assert.ok(
                    !(logger.transports[i] instanceof transports.Console)
                );
            }
        });
    });
    describe('development mode test', () => {
        before('set NODE_ENV to development', () => {
            process.env.NODE_ENV = 'development';
        });
        after('reset NODE_ENV', () => {
            process.env.NODE_ENV = prev_node_env;
        });
        it('development mode logs to console', () => {
            let cnt_console_logger = 0;
            for (let i = 0; i < logger.transports.length; ++i) {
                if (logger.transports[i] instanceof transports.Console) {
                    cnt_console_logger += 1;
                }
            }
            assert.ok(cnt_console_logger > 0);
        });
    });
});
