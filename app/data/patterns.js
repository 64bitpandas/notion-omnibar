import * as chrono from 'chrono-node';
import wordsToNumbers from 'words-to-numbers';

export const PROMISE = 'promise';
export const COMMIT = 'commit';
export const NOW = 'today';

// millisecond conversions
export const MINUTE = 60000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const DEFAULT_PATTERNS = {
  '$1 at $DATE1': {
    type: PROMISE,
    description: 1,
    priority: 0,
  },
  '$1 at $DATE1 for $DURATION2': {
    type: PROMISE,
    description: 1,
    start: 'DATE1',
    duration: 'DURATION2',
    priority: 0,
  },
  '$1 before $DATE1': {
    type: PROMISE,
    description: 1,
    priority: 0,
  },
  // '$1 every $DATE1': {
  //   type: PROMISE,
  //   description: 1,
  //   priority: 0,
  // },
  '$1 from $DATE1 to $DATE2': {
    type: PROMISE,
    description: 1,
    start: 'DATE1',
    end: 'DATE2',
    priority: 0,
  },
  '$1 for $DURATION1': {
    type: COMMIT,
    description: 1,
    end: NOW,
    duration: 'DURATION1',
  },
  $1: {
    type: COMMIT,
    description: 1,
    priority: -1,
  },
};

const TEMP_LABELS = {
  school: {
    color: 'blue',
    keywords: ['school', 'homework', 'hw'],
  },
};

const DEFAULT_CAPTURES = {
  DATE: getDate,
  DURATION: getDuration,
};

// export const checkPattern = (pattern, str) => {
//   const splitPattern = pattern.split(' ');
//   const splitStr = str.split(' ');

//   while (splitPattern.length > 0) {
//     splitPattern.splice(0, 1);
//   }
// };

// export const applyPattern = (pattern, str) => {
//   if (PATTERNS[pattern] === undefined)
//     throw new Error(`Undefined pattern: ${pattern}`);
//   const data = PATTERNS[pattern];
//   return {
//     type: data.type,
//     description: false,
//   };
// };

export const getDate = str => {
  const parse = chrono.parse(str, chrono.parseDate('today'), {
    forwardDate: true,
  });
  if (parse.length > 0) {
    return parse[0].start.date();
  }
  return false;
};

// Returns a duration in milliseconds, false if not a duration.
export const getDuration = str => {
  const cleaned = clean(str).split(' ');
  if (cleaned.length === 0) return false;

  let multiplier = '';
  let total = 0;
  cleaned.forEach(chunk => {
    if (isUnit(chunk)) {
      const midvalue = multiplierToDuration(clean(multiplier), chunk);
      if (midvalue) {
        total += midvalue;
      }
      multiplier = '';
    } else {
      multiplier += `${chunk} `;
    }
  });

  return total === 0 ? false : total;
};

const multiplierToDuration = (multiplier, unit) => {
  let num;
  if (multiplier === '') return false;
  if (multiplier === 'a' || multiplier === 'an') num = 1;
  else if (multiplier === 'one and a half' || multiplier === 'one and one half')
    num = 1.5;
  else if (isNumeric(multiplier)) num = Number(multiplier);
  else num = wordsToNumbers(multiplier, { fuzzy: true });

  if (typeof num !== 'number') return false;

  switch (unit) {
    case 'day':
    case 'days':
      return DAY * num;
    case 'hour':
    case 'hours':
      return HOUR * num;
    case 'minute':
    case 'minutes':
      return MINUTE * num;
    case 'month':
    case 'months':
      return DAY * 30 * num;
    case 'year':
    case 'years':
      return DAY * 365 * num;
    default:
      return false;
  }
};

const isUnit = str => {
  let units = ['day', 'hour', 'minute', 'month', 'year'];
  units = units.concat(units.map(unit => `${unit}s`));
  return units.includes(str);
};

export const getCaptureGroup = str =>
  new RegExp(`^\\$(${Object.keys(DEFAULT_CAPTURES).join('|')})?\\d+$`).test(str)
    ? str.substring(1)
    : false;

export const readCaptureGroups = (pattern, str) => {
  const splitPattern = pattern.split(' ');
  const splitStr = str.split(' ');
  const result = {};

  splitPattern.forEach((chunk, index) => {
    const group = getCaptureGroup(chunk);
    if (group) {
      while (
        splitStr.length > 0 &&
        ((splitPattern.length > index + 1 &&
          clean(splitStr[0]) !== splitPattern[index + 1]) ||
          splitPattern.length <= index + 1)
      ) {
        result[group] =
          result[group] === undefined
            ? splitStr[0]
            : [result[group], splitStr[0]].join(' ');
        splitStr.splice(0, 1);
      }
    } else {
      splitStr.splice(0, 1);
    }
  });

  return result;
};

export const findLabels = str => {
  const labels = new Set();
  Object.keys(TEMP_LABELS).forEach(label => {
    if (TEMP_LABELS[label].keywords.some(key => str.includes(key))) {
      labels.add(label);
    }
  });
  return Array.from(labels);
};

const clean = str => str.trim().toLowerCase();
const isNumeric = value => /^\d+$/.test(value);
