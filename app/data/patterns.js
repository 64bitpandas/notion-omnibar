import * as chrono from 'chrono-node';
import nlp from 'compromise';
import wordsToNumbers from 'words-to-numbers';

export const PROMISE = 'promise';
export const COMMIT = 'commit';
export const NOW = 'today';

const TENSE = 'TENSE';

// millisecond conversions
export const MINUTE = 60000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const DEFAULT_PATTERNS = {
  // '$1 at $DATE1': {
  //   type: TENSE,
  //   description: 1,
  //   priority: 0,
  //   start: 'DATE1',
  // },
  '$1 on $DATE1': {
    type: TENSE,
    description: 1,
    priority: 0,
    start: 'DATE1',
  },
  '$1 at $DATE1 for $DURATION2': {
    type: PROMISE,
    description: 1,
    start: 'DATE1',
    duration: 'DURATION2',
    priority: 5,
  },
  '$1 on $DATE1 for $DURATION2': {
    type: PROMISE,
    description: 1,
    start: 'DATE1',
    duration: 'DURATION2',
    priority: 5,
  },
  '$1 before $DATE1': {
    type: PROMISE,
    description: 1,
    priority: 0,
    start: 'DATE1',
  },
  // '$1 every $DATE1': {
  //   type: PROMISE,
  //   description: 1,
  //   priority: 0,
  // },
  // '$1 from $DATE1 to $DATE2': {
  //   type: TENSE,
  //   description: 1,
  //   start: 'DATE1',
  //   end: 'DATE2',
  //   priority: 5,
  // },
  '$1 for $DURATION1': {
    type: COMMIT,
    description: 1,
    end: NOW,
    duration: 'DURATION1',
    priority: 0,
  },
  '$1 for $DURATION1 starting $DATE1': {
    type: COMMIT,
    description: 1,
    start: 'DATE1',
    duration: 'DURATION1',
    priority: 5,
  },
  '$1 for $DURATION1 ending $DATE1': {
    type: COMMIT,
    description: 1,
    end: 'DATE1',
    duration: 'DURATION1',
    priority: 5,
  },
  '$1 for $DURATION1 from $DATE2': {
    type: COMMIT,
    description: 1,
    end: 'DATE1',
    duration: 'DURATION1',
    priority: 5,
  },
  $1: {
    type: TENSE,
    description: 1,
    priority: -1,
  },
};

export const TEMP_LABELS = {
  school: {
    color: '#fec89a',
    emoji: '📘',
    keywords: ['school', 'homework', 'hw'],
  },
};

/** Returns a Date object, or false if str cannot be parsed into a date.
 *  Set forwardDate to true if this date is in the future, false if it
 *  is in the past.
 */
export const getDate = (str, args) => {
  const parse = chrono.parse(str, today(), {
    forwardDate: args ? args.forwardDate : true,
  });
  if (parse.length > 0) {
    return parse[0].start.date();
  }
  return false;
};

/** Returns a duration in milliseconds, false if not a duration. */
export const getDuration = str => {
  if (str === undefined) return false;
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

const DEFAULT_CAPTURES = {
  DATE: getDate,
  DURATION: getDuration,
};

/** Verifies that a string matches a particular pattern. */
export const checkPattern = (pattern, str) => {
  const groups = readCaptureGroups(pattern, str);
  const splitPattern = pattern.split(' ');

  let valid = true;
  let reconstructedStr = '';

  splitPattern.forEach(chunk => {
    if (getCaptureGroup(chunk)) {
      reconstructedStr += ` ${groups[getCaptureGroup(chunk)]}`;
      if (getCaptureType(chunk)) {
        valid =
          valid && applyCaptureType(groups[getCaptureGroup(chunk)], chunk);
      }
    } else reconstructedStr += ` ${chunk}`;
  });

  return valid && clean(reconstructedStr) === clean(str);
};

/**
 * Applies capture groups to a pattern to return a final object with all data.
 */
export const applyPattern = (pattern, str) => {
  if (DEFAULT_PATTERNS[pattern] === undefined)
    throw new Error(`Undefined pattern: ${pattern}`);
  const data = DEFAULT_PATTERNS[pattern];
  const groups = readCaptureGroups(pattern, str);
  const result = {};

  if (data.type === TENSE) {
    result.type = Object.keys(groups).some(key => isPastTense(groups[key]))
      ? COMMIT
      : PROMISE;
  }

  Object.keys(data).forEach(key => {
    if (groups[data[key]] !== undefined) {
      result[key] =
        applyCaptureType(groups[data[key]], data[key], {
          forwardDate: result.type === PROMISE,
        }) || groups[data[key]];
    } else result[key] = result[key] || data[key];
  });

  // Fill in start/end given durations
  if (result.start && result.duration) {
    if (result.start === NOW) result.start = today();
    result.end = result.end || result.start + result.duration;
  } else if (result.end && result.duration) {
    if (result.end === NOW) result.end = today();
    result.start = result.start || result.end - result.duration;
  } else {
    // Infer date from non-pattern
    Object.keys(groups).forEach(key => {
      const date = chrono.parse(groups[key], today(), {
        forwardDate: result.type === PROMISE,
      });
      if (date.length > 0) {
        result.start = date[0].start.date();
        result.end = date[0].end ? date[0].end.date() : undefined;
        result.description = result.description.replace(date[0].text, '');
        console.log(result.start);
      }
    });
  }

  return {
    ...result,
    timestamp: today(),
  };
};

export const applyAllPatterns = str => {
  let result = [];
  if (clean(str) === '') return result;
  Object.keys(DEFAULT_PATTERNS).forEach(pattern => {
    if (checkPattern(pattern, str)) result.push(applyPattern(pattern, str));
  });
  result = result.sort((a, b) => b.priority - a.priority);
  if (result.length > 1) {
    result = result.filter(item => item.priority >= 0);
  }
  return result;
};

/** Converts a natural language duration (like 'two hours ten minutes') to milliseconds. */
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

// Returns true if the input string is a valid unit of time, false otherwise.
const isUnit = str => {
  let units = ['day', 'hour', 'minute', 'month', 'year'];
  units = units.concat(units.map(unit => `${unit}s`));
  return units.includes(str);
};

// Takes in a string of format $TYPE1 and returns just the TYPE1 portion of it,
// or false if the string isn't in the correct format.
export const getCaptureGroup = str =>
  new RegExp(`^\\$(${Object.keys(DEFAULT_CAPTURES).join('|')})?\\d+$`).test(str)
    ? str.substring(1)
    : false;

// Takes in a string of format $TYPE1 or TYPE1 and returns just the TYPE portion of it.
const getCaptureType = str => {
  const group = getCaptureGroup(str) || getCaptureGroup(`$${str}`);
  if (!group) return false;

  return Object.keys(DEFAULT_CAPTURES).find(
    capture => group.substring(0, capture.length) === capture,
  );
};

// Applices a given capture type (like DATE), or
// returns false if the given capture is invalid.
const applyCaptureType = (str, capture, args) => {
  const cap = getCaptureType(capture);
  if (DEFAULT_CAPTURES[cap]) {
    return DEFAULT_CAPTURES[cap](str, args);
  }
  return false;
};

// Given a string and a pattern, returns an object whose
// keys are the capture groups and the values are the
// strings they are mapped to.
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
const isPastTense = str =>
  nlp(str)
    .match('.? #PastTense .?')
    .terms()
    .text() !== '';
export const today = () => chrono.parseDate('today');
