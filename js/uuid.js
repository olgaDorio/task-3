/* eslint-disable */

module.exports = () => (
  Array.from({ length: 32 }).map((v, i) => {
    const random = Math.random() * 16 | 0;
    const prefix = i === 8 || i === 12 || i === 16 || i === 20 ? '-' : '';
    const ifIsntTwelve = i === 16 ? (random & 3) | 8 : random;
    const main = i === 12 ? 4 : ifIsntTwelve;
    return `${prefix}${main.toString(16)}`;
  }).join('')
);
