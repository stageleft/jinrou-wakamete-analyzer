'use strict';

import { createDateArray } from '../src/libs.js';
describe('test suite of createDateArray', () => {
    test('createDateArray : empty log', () => {
        const arg = {
            log: null
        };
        const log_days = 0;
        expect(createDateArray(arg, log_days)).toStrictEqual([]);
    });
    test('createDateArray : start-day (day1 AM) log', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {}
            }
        };
        const log_days = 0;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。"],"１日目の朝となりました。"]);
    });
    test('createDateArray : start-night (day1 PM) log', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {}
            }
        };
        const log_days = 0;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "１日目の夜となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : day2 AM log', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {}
            }
        };
        const log_days = 0;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "2日目の朝となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : day2 PM log', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {},
                "2日目の夜となりました。": {}
            }
        };
        const log_days = 0;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "2日目の朝となりました。", "2日目の夜となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : day3 AM log', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {},
                "2日目の夜となりました。": {},
                "3日目の朝となりました。": {}
            }
        };
        const log_days = 0;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "2日目の朝となりました。", "3日目の朝となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : day3 PM log', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {},
                "2日目の夜となりました。": {},
                "3日目の朝となりました。": {},
                "3日目の夜となりました。": {}
            }
        };
        const log_days = 0;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "2日目の朝となりました。", "3日目の朝となりました。", "3日目の夜となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : after play log (villager)', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {},
                "2日目の夜となりました。": {},
                "3日目の朝となりました。": {},
                "3日目の夜となりました。": {},
                "「村　人」の勝利です！": {},
            }
        };
        const log_days = 0;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "2日目の朝となりました。", "3日目の朝となりました。", "3日目の夜となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : after play log (werecat))', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {},
                "2日目の夜となりました。": {},
                "3日目の朝となりました。": {},
                "3日目の夜となりました。": {},
                "「猫　又」の勝利です！": {},
            }
        };
        const log_days = 0;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "2日目の朝となりました。", "3日目の朝となりました。", "3日目の夜となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : after play log (werewolf)', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {},
                "2日目の夜となりました。": {},
                "3日目の朝となりました。": {},
                "3日目の夜となりました。": {},
                "「人　狼」の勝利です！": {},
            }
        };
        const log_days = 0;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "2日目の朝となりました。", "3日目の朝となりました。", "3日目の夜となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : after play log (werefox)', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {},
                "2日目の夜となりました。": {},
                "3日目の朝となりました。": {},
                "3日目の夜となりました。": {},
                "「妖　狐」の勝利です！": {},
            }
        };
        const log_days = 0;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "2日目の朝となりました。", "3日目の朝となりました。", "3日目の夜となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : after play log (werefox)', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {},
                "2日目の夜となりました。": {},
                "3日目の朝となりました。": {},
                "3日目の夜となりました。": {},
                "「引き分け」です！": {},
            }
        };
        const log_days = 0;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "2日目の朝となりました。", "3日目の朝となりました。", "3日目の夜となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : date limit (1 day)', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {},
                "2日目の夜となりました。": {},
                "3日目の朝となりました。": {},
                "3日目の夜となりました。": {},
                "「村　人」の勝利です！": {},
            }
        };
        const log_days = 1;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : date limit (2 day)', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {},
                "2日目の夜となりました。": {},
                "3日目の朝となりました。": {},
                "3日目の夜となりました。": {},
                "「村　人」の勝利です！": {},
            }
        };
        const log_days = 2;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "2日目の朝となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : date limit (3 day)', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {},
                "2日目の夜となりました。": {},
                "3日目の朝となりました。": {},
                "3日目の夜となりました。": {},
                "「村　人」の勝利です！": {},
            }
        };
        const log_days = 3;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "2日目の朝となりました。", "3日目の朝となりました。", "3日目の夜となりました。"],"１日目の夜となりました。"]);
    });
    test('createDateArray : date limit (4 day)', () => {
        const arg = {
            log: {
                "１日目の朝となりました。": {},
                "１日目の夜となりました。": {},
                "2日目の朝となりました。": {},
                "2日目の夜となりました。": {},
                "3日目の朝となりました。": {},
                "3日目の夜となりました。": {},
                "「村　人」の勝利です！": {},
            }
        };
        const log_days = 4;
        expect(createDateArray(arg, log_days)).toStrictEqual([["１日目の朝となりました。", "2日目の朝となりました。", "3日目の朝となりました。", "3日目の夜となりました。"],"１日目の夜となりました。"]);
    });
});

import { logTag_d2n } from '../src/libs.js';
describe('test suite of logTag_d2n', () => {

    test('logTag_d2n : previous day1 PM -> day1 PM', () => { // Any other than dayX AM : same letter.
        expect(logTag_d2n("１日目の夜となりました。")).toBe("１日目の夜となりました。");
    });

    test('logTag_d2n : previous day2 AM -> day1 PM', () => { // day 2 AM : day 1 PM has wide letter "１"
        expect(logTag_d2n("2日目の朝となりました。")).toBe("１日目の夜となりました。");
    });

    test('logTag_d2n : previous day2 PM -> day2 PM', () => { // Any other than dayX AM : same letter.
        expect(logTag_d2n("2日目の夜となりました。")).toBe("2日目の夜となりました。");
    });

    test('logTag_d2n : previous day3 AM -> day2 PM', () => { // day X(X>=3) AM : day (X-1) PM.
        expect(logTag_d2n("3日目の朝となりました。")).toBe("2日目の夜となりました。");
    });

    test('logTag_d2n : previous day3 PM -> day3 PM', () => { // Any other than dayX AM : same letter.
        expect(logTag_d2n("3日目の夜となりました。")).toBe("3日目の夜となりました。");
    });
});
