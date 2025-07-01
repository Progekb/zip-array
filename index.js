const base91Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~\"";

function encodeBase91(data) {
  let b = 0, n = 0;
  let output = '';

  for (let byte of data) {
    b |= byte << n;
    n += 8;
    while (n > 13) {
      let v = b & 8191;

      if (v > 88) {
        b >>= 13;
        n -= 13;
      } else {
        v = b & 16383;
        b >>= 14;
        n -= 14;
      }
      output += base91Chars[v % 91] + base91Chars[Math.floor(v / 91)];
    }
  }
  if (n) output += base91Chars[b % 91] + (n > 7 ? base91Chars[Math.floor(b / 91)] : '');
  return output;
}

function decodeBase91(str) {
  let v = -1, b = 0, n = 0;
  let output = [];

  for (let i = 0; i < str.length; i++) {
    const c = base91Chars.indexOf(str[i]);
    if (c === -1) throw new Error('Не base91');

    if (v < 0) {
      v = c;
    } else {
      v += c * 91;
      b |= v << n;
      n += (v & 8191) > 88 ? 13 : 14;
      do {
        output.push(b & 255);
        b >>= 8;
        n -= 8;
      } while (n > 7);
      v = -1;
    }
  }

  if (v >= 0) output.push((b | (v << n)) & 255);
  return output;
}

function serialize(nums) {
  const bytes = [];
  for (let num of nums) {
    if (num < 128) {
      bytes.push(num & 0x7F);
    } else {
      bytes.push(0x80 | ((num >> 7) & 0x7F));
      bytes.push(num & 0x7F);
    }
  }
  return encodeBase91(bytes);
}

function unserialize(str) {
  const bytes = decodeBase91(str);
  const nums = [];
  let i = 0;
  while (i < bytes.length) {
    const first = bytes[i];
    if ((first & 0x80) === 0) {
      nums.push(first);
      i += 1;
    } else {
      const second = bytes[i + 1];
      nums.push(((first & 0x7F) << 7) | (second & 0x7F));
      i += 2;
    }
  }
  return nums;
}

const tests = [
  { title: "простейшие короткие", nums: [2, 3, 5, 7, 9] },
  { title: "случайные - 50 чисел", nums: Array.from({ length: 50 }, (_, i) => i + 1) },
  { title: "случайные - 100 чисел", nums: Array.from({ length: 100 }, (_, i) => i + 1) },
  { title: "случайные - 500 чисел", nums: Array.from({ length: 500 }, () => Math.floor(Math.random() * 300) + 1) },
  { title: "случайные - 1000 чисел", nums: Array.from({ length: 1000 }, () => Math.floor(Math.random() * 300) + 1) },
  { title: "все числа 1 знака", nums: Array.from({ length: 9 }, (_, i) => i + 1) },
  { title: "все числа из 2х знаков", nums: Array.from({ length: 90 }, (_, i) => i + 10) },
  { title: "все числа из 3х знаков", nums: Array.from({ length: 201 }, (_, i) => i + 100) },
  { title: "каждого числа по 3 - всего чисел 900", nums: Array.from({ length: 900 }, (_, i) => (i % 300) + 1) },
];

for (const { title, nums } of tests) {
  const ser = serialize(nums);
  const unser = unserialize(ser);

  console.log(`-------------------------------------------------`);
  console.log(title);
  console.log('Было:', ser.length);
  console.log('Стало:', unser.length);
  console.log('Сжатие:', (ser.length / unser.length).toFixed(2), 'x');
  console.log('Сходится до и после сериалайза:', JSON.stringify(nums) === JSON.stringify(unser));
}
