'use strict';

import { createDateArray } from '../src/libs.js';
describe('createDateArray', () => {
    it('empty log', () => {
        expect.assertions(1);
        const arg = {
            log: null
        };
        expect(createDateArray(arg)).toStrictEqual([]);
    });

    /*
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
    test('createDateArray : ignore after play log (villager)', () => {
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
    test('createDateArray : ignore after play log (werecat))', () => {
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
    test('createDateArray : ignore after play log (werewolf)', () => {
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
    test('createDateArray : ignore after play log (werefox)', () => {
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
    test('createDateArray : ignore after play log (draw)', () => {
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
    */
});

import { logTag_d2n } from '../src/libs.js';
describe('test suite of logTag_d2n', () => {

    it('previous day1 PM -> day1 PM as same letter', () => {
        expect.assertions(1);
        expect(logTag_d2n("１日目の夜となりました。")).toBe("１日目の夜となりました。");
    });

    it('previous day2 AM -> day1 PM as wide １ letter', () => {
        expect.assertions(1);
        expect(logTag_d2n("2日目の朝となりました。")).toBe("１日目の夜となりました。");
    });

    it('previous day2 PM -> day2 PM as same letter', () => {
        expect.assertions(1);
        expect(logTag_d2n("2日目の夜となりました。")).toBe("2日目の夜となりました。");
    });

    it('previous day3 AM -> day2 PM as standard (X-1) letter', () => {
        expect.assertions(1);
        expect(logTag_d2n("3日目の朝となりました。")).toBe("2日目の夜となりました。");
    });

    it('previous day3 PM -> day3 PM as same letter', () => {
        expect.assertions(1);
        expect(logTag_d2n("3日目の夜となりました。")).toBe("3日目の夜となりました。");
    });
});

import { setColorClass } from '../src/libs.js';
describe('test suite of setColorClass', () => {
    const job_map = {
        "村人":"",
        "占い":"seer",
        "霊能":"medium",
        "狩人":"bodyguard",
        "共有":"freemason",
        "猫又":"werecat"
    };
    const mob_map = {
        "村人":"villager",
        "人外":"enemy",
        "人狼":"werewolf",
        "狂人":"posessed",
        "妖狐":"werefox",
        "子狐":"minifox"
    };
    Object.keys(job_map).forEach((comingout_info) => {
        Object.keys(mob_map).forEach((enemymark_info) => {
            it('co[' + comingout_info + '] and mark[' +  enemymark_info + ']', () => {
                expect.assertions(1);
                // input  : JSON Object : arg.input.each_player['target player']
                const player_info = {
                    comingout: comingout_info,
                    enemymark: enemymark_info
                };
                if (enemymark_info === "村人") {
                    expect(setColorClass(player_info)).toBe(job_map[comingout_info]);
                } else {
                    expect(setColorClass(player_info)).toBe(mob_map[enemymark_info]);
                }
            });        
        });
    });

    it('illegal case', () => {
        expect.assertions(2);
        expect(setColorClass(undefined)).toBeUndefined();
        expect(setColorClass(null)).toBeUndefined();
    });
});
