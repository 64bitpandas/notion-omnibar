export const PROMISE = 'promise';
export const COMMIT = 'commit';

export const PATTERNS = {
  '$1 at $DATE1': {
    type: PROMISE,
    description: 1,
    priority: 0,
  },
  '$1 before $DATE1': {
    type: PROMISE,
    description: 1,
    priority: 0,
  },
  '$1 every $DATE1': {
    type: PROMISE,
    description: 1,
    priority: 0,
  },
  $1: {
    type: COMMIT,
    description: 1,
    priority: -1,
  },
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

export const getCaptureGroup = str =>
  /^\$(DATE)?\d+$/.test(str) ? str.substring(1) : false;

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

const clean = str => str.trim().toLowerCase();
