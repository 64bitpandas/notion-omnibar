import {
  getCaptureGroup,
  readCaptureGroups,
  findLabels,
  getDate,
  getDuration,
  DAY,
  HOUR,
  MINUTE,
  checkPattern,
} from '../patterns';

describe('getCaptureGroup()', () => {
  test('accepts numbers', () => {
    expect(getCaptureGroup('$1')).toEqual('1');
    expect(getCaptureGroup('$123981239012')).toEqual('123981239012');
  });

  test('accepts dates', () => {
    expect(getCaptureGroup('$DATE1')).toEqual('DATE1');
    expect(getCaptureGroup('$DURATION1')).toEqual('DURATION1');
  });

  test('rejects empty', () => {
    expect(getCaptureGroup('$')).toBeFalsy();
    expect(getCaptureGroup('')).toBeFalsy();
  });
  test('rejects malformed', () => {
    expect(getCaptureGroup('foobar')).toBeFalsy();
    expect(getCaptureGroup('$1d')).toBeFalsy();
    expect(getCaptureGroup('$DATE')).toBeFalsy();
  });
});

describe('readCaptureGroups()', () => {
  test('accepts single capture group', () => {
    expect(readCaptureGroups('$1', 'hello world')).toMatchObject({
      '1': 'hello world',
    });
  });

  test('returns empty if no capture groups', () => {
    expect(readCaptureGroups('foo bar', 'hello world')).toMatchObject({});
  });

  test('accepts multiple capture groups', () => {
    expect(
      readCaptureGroups('$1 with $2', 'hello world with foo bars'),
    ).toMatchObject({
      '1': 'hello world',
      '2': 'foo bars',
    });

    expect(
      readCaptureGroups(
        '$1 with $2 and $3',
        'hello world with foo bars and fizz buzz',
      ),
    ).toMatchObject({
      '1': 'hello world',
      '2': 'foo bars',
      '3': 'fizz buzz',
    });
  });
});

describe('findLabels()', () => {
  test('returns empty if no labels found', () => {
    expect(findLabels('no labels here')).toEqual([]);
  });
  test('returns a label', () => {
    expect(findLabels('do hw')).toEqual(['school']);
    expect(findLabels('do homework')).toEqual(['school']);
    expect(findLabels('do school work')).toEqual(['school']);
  });
  test('has no duplicate labels', () => {
    expect(findLabels('do homework and hw and school')).toEqual(['school']);
  });
});

describe('getDate()', () => {
  test('gets basic dates', () => {
    expect(getDate('today')).toBeTruthy();
    expect(getDate('tomorrow')).toBeTruthy();
    expect(getDate('tuesday')).toBeTruthy();
    expect(getDate('next tuesday')).toBeTruthy();
    expect(getDate('4 weeks from now')).toBeTruthy();
    expect(getDate('5 years from now')).toBeTruthy();
  });

  test('reject non dates', () => {
    expect(getDate('no date here')).toBeFalsy();
    expect(getDate('foobarday')).toBeFalsy();
    expect(getDate('4 hours')).toBeFalsy();
  });

  // test('chrono testing', () => {
  //   // expect(chrono.parse('tuesday')).toBeFalsy();
  //   expect(getDate('tuesday')).toBeFalsy();
  // })
});

describe('getDuration()', () => {
  test('works on singular durations', () => {
    expect(getDuration('1 day')).toEqual(DAY);
    expect(getDuration('one day')).toEqual(DAY);
    expect(getDuration('a day')).toEqual(DAY);
    expect(getDuration('an hour')).toEqual(HOUR);
    expect(getDuration('one year')).toEqual(DAY * 365);
    expect(getDuration('1 month')).toEqual(DAY * 30);
  });

  test('works on multiples', () => {
    expect(getDuration('24 hours')).toEqual(DAY);
    expect(getDuration('three hundred sixty-five days')).toEqual(DAY * 365);
  });

  test('works on varied units', () => {
    expect(getDuration('one and a half hours')).toEqual(HOUR * 1.5);
    expect(getDuration('one hour 10 minutes')).toEqual(HOUR + MINUTE * 10);
    expect(getDuration('3 months 10 days 3 minutes')).toEqual(
      DAY * 30 * 3 + 10 * DAY + MINUTE * 3,
    );
  });

  test('rejects invalid', () => {
    expect(getDuration('foo bar')).toBeFalsy();
    expect(getDuration('days')).toBeFalsy();
    expect(getDuration('minute days')).toBeFalsy();
    expect(getDuration('')).toBeFalsy();
  });

  test('works on fuzzy inputs', () => {
    expect(getDuration('on day')).toEqual(DAY);
    expect(getDuration('on hundrd days')).toEqual(DAY * 100);
  });
});

describe('checkPattern()', () => {
  test('works on basic patterns', () => {
    expect(checkPattern(`$1`, 'hello world')).toBeTruthy();
    expect(checkPattern(`$1 and $2`, 'hello world and foo bars')).toBeTruthy();
  });
  test('rejects invalid', () => {
    expect(checkPattern(`$1 and $2`, 'hello world')).toBeFalsy();
  });

  test('works on dates and durations', () => {
    expect(
      checkPattern(`it's $DATE1 my bois`, `it's tuesday my bois`),
    ).toBeTruthy();
    expect(checkPattern(`it's $DATE1 my bois`, `it's sad my bois`)).toBeFalsy();
    expect(checkPattern(`in $DURATION1`, `in foobars`)).toBeFalsy();
    expect(checkPattern(`in $DURATION1`, `in january`)).toBeFalsy();
    expect(checkPattern(`in $DURATION1`, `in 4 hours 30 minutes`)).toBeTruthy();
  });
});
