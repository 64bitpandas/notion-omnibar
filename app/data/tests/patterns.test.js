import { getCaptureGroup, readCaptureGroups } from '../patterns';

describe('getCaptureGroup()', () => {
  test('accepts numbers', () => {
    expect(getCaptureGroup('$1')).toEqual('1');
    expect(getCaptureGroup('$123981239012')).toEqual('123981239012');
  });

  test('accepts dates', () => {
    expect(getCaptureGroup('$DATE1')).toEqual('DATE1');
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
