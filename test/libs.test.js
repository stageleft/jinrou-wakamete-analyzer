'use strict';

import { logTag_d2n } from '../src/libs.js';

test('previous day1 PM -> day1 PM', () => { // Any other than dayX AM : same letter.
    expect(logTag_d2n("１日目の夜となりました。")).toBe("１日目の夜となりました。");
});

test('previous day2 AM -> day1 PM', () => { // day 2 AM : day 1 PM has wide letter "１"
    expect(logTag_d2n("2日目の朝となりました。")).toBe("１日目の夜となりました。");
});

test('previous day2 PM -> day2 PM', () => { // Any other than dayX AM : same letter.
    expect(logTag_d2n("2日目の夜となりました。")).toBe("2日目の夜となりました。");
});

test('previous day3 AM -> day2 PM', () => { // day X(X>=3) AM : day (X-1) PM.
    expect(logTag_d2n("3日目の朝となりました。")).toBe("2日目の夜となりました。");
});

test('previous day3 PM -> day3 PM', () => { // Any other than dayX AM : same letter.
    expect(logTag_d2n("3日目の夜となりました。")).toBe("3日目の夜となりました。");
});
