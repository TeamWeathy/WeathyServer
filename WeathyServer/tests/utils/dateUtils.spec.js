const assert = require('assert');
const dateUtils = require('../../utils/dateUtils');

describe('dateUtils test', function () {
    describe('getYear test', function () {
        it('Possible to parse year from YYYY-MM-DD', function () {
            assert.strictEqual(dateUtils.getYear('1999-00-00'), 1999);
        });
        it('Possible to parse year from YYYY-MM', function () {
            assert.strictEqual(dateUtils.getYear('1999-00'), 1999);
        });
    });

    describe('getMonth test', function () {
        it('Possible to parse month from YYYY-MM-DD', function () {
            assert.strictEqual(dateUtils.getMonth('1999-04-00'), 4);
        });
        it('Possible to parse month from YYYY-MM', function () {
            assert.strictEqual(dateUtils.getMonth('1999-04'), 4);
        });
    });

    describe('format12 test', function () {
        it('Format12 returns at 12pm', function () {
            assert.strictEqual(dateUtils.format12(12), '오후 12시');
        });
        it('Format12 returns at 12pm', function () {
            assert.strictEqual(dateUtils.format12(0), '오전 12시');
        });
        it('Format12 returns at 1pm', function () {
            assert.strictEqual(dateUtils.format12(13), '오후 1시');
        });
        it('Format12 returns at 1am', function () {
            assert.strictEqual(dateUtils.format12(1), '오전 1시');
        });
    });

    describe('format24 test', function () {
        it('Format24 returns at 12pm', function () {
            assert.strictEqual(dateUtils.format24(12), '12시');
        });
        it('Format24 returns at 12pm', function () {
            assert.strictEqual(dateUtils.format24(0), '0시');
        });
        it('Format24 returns at 1pm', function () {
            assert.strictEqual(dateUtils.format24(13), '13시');
        });
        it('Format24 returns at 1am', function () {
            assert.strictEqual(dateUtils.format24(1), '1시');
        });
    });

    describe('getNextHour test', function () {
        it('getNextHour increase time', function () {
            const { date, time } = dateUtils.getNextHour('1999-01-01', 12);
            assert.strictEqual(date, '1999-01-01');
            assert.strictEqual(time, 13);
        });
        it('getNextHour increase date and reset time when date change', function () {
            const { date, time } = dateUtils.getNextHour('1999-01-01', 23);
            assert.strictEqual(date, '1999-01-02');
            assert.strictEqual(time, 0);
        });
    });
});
