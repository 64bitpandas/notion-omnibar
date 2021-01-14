import chrono from 'chrono-node';

// export const DAYS = {
//   monday: 1,
//   tuesday: 2,
//   wednesday: 3,
//   thursday: 4,
//   friday: 5,
//   saturday: 6,
//   sunday: 7,
//   mon: 1,
//   tue: 2,
//   wed: 3,
//   thu: 4,
//   fri: 5,
//   sat: 6,
//   sun: 7,
//   tues: 2,
//   weds: 3,
//   thurs: 4,
// };

export const parseDate = str => {
  chrono.parse(str);
};
