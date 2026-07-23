const VERSION = 5;
const SIZE = VERSION * 4 + 17;
const DATA_CODEWORDS = 108;
const ECC_CODEWORDS = 26;
const FORMAT_ECL_BITS = 1; // Error correction L
const MASK = 0;

type Matrix = boolean[][];

function gfMultiply(x: number, y: number) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function reedSolomonDivisor(degree: number) {
  const result = Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 2);
  }
  return result;
}

function reedSolomonRemainder(data: number[], degree: number) {
  const divisor = reedSolomonDivisor(degree);
  const result = Array<number>(degree).fill(0);
  for (const value of data) {
    const factor = value ^ result.shift()!;
    result.push(0);
    for (let i = 0; i < degree; i++) {
      result[i] ^= gfMultiply(divisor[i], factor);
    }
  }
  return result;
}

function appendBits(bits: number[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i--) {
    bits.push((value >>> i) & 1);
  }
}

function encodeData(text: string) {
  const bytes = Array.from(new TextEncoder().encode(text));
  if (bytes.length > 106) {
    throw new Error("QR payload is too long for the donation QR block.");
  }

  const bits: number[] = [];
  appendBits(bits, 0x4, 4); // Byte mode
  appendBits(bits, bytes.length, 8);
  bytes.forEach(byte => appendBits(bits, byte, 8));

  const capacityBits = DATA_CODEWORDS * 8;
  appendBits(bits, 0, Math.min(4, capacityBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(bits.slice(i, i + 8).reduce((acc, bit) => (acc << 1) | bit, 0));
  }
  for (let pad = 0xec; data.length < DATA_CODEWORDS; pad ^= 0xec ^ 0x11) {
    data.push(pad);
  }
  return data;
}

function createEmptyMatrix() {
  return {
    modules: Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false)),
    reserved: Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false)),
  };
}

function setModule(matrix: Matrix, reserved: Matrix, x: number, y: number, dark: boolean, isReserved = true) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  matrix[y][x] = dark;
  if (isReserved) reserved[y][x] = true;
}

function drawFinder(matrix: Matrix, reserved: Matrix, x: number, y: number) {
  for (let dy = -1; dy <= 7; dy++) {
    for (let dx = -1; dx <= 7; dx++) {
      const xx = x + dx;
      const yy = y + dy;
      const inFinder = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const dark = inFinder && (
        dx === 0 || dx === 6 || dy === 0 || dy === 6 ||
        (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
      );
      setModule(matrix, reserved, xx, yy, dark);
    }
  }
}

function drawAlignment(matrix: Matrix, reserved: Matrix, centerX: number, centerY: number) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      setModule(matrix, reserved, centerX + dx, centerY + dy, distance !== 1);
    }
  }
}

function drawFunctionPatterns(matrix: Matrix, reserved: Matrix) {
  drawFinder(matrix, reserved, 0, 0);
  drawFinder(matrix, reserved, SIZE - 7, 0);
  drawFinder(matrix, reserved, 0, SIZE - 7);
  drawAlignment(matrix, reserved, 30, 30);

  for (let i = 0; i < SIZE; i++) {
    if (!reserved[6][i]) setModule(matrix, reserved, i, 6, i % 2 === 0);
    if (!reserved[i][6]) setModule(matrix, reserved, 6, i, i % 2 === 0);
  }

  for (let i = 0; i < 9; i++) {
    setModule(matrix, reserved, 8, i, false);
    setModule(matrix, reserved, i, 8, false);
  }
  for (let i = SIZE - 8; i < SIZE; i++) {
    setModule(matrix, reserved, 8, i, false);
    setModule(matrix, reserved, i, 8, false);
  }
  setModule(matrix, reserved, 8, VERSION * 4 + 9, true);
}

function getBit(value: number, index: number) {
  return ((value >>> index) & 1) !== 0;
}

function getFormatBits() {
  const data = (FORMAT_ECL_BITS << 3) | MASK;
  let remainder = data;
  for (let i = 0; i < 10; i++) {
    remainder = (remainder << 1) ^ (((remainder >>> 9) & 1) * 0x537);
  }
  return ((data << 10) | remainder) ^ 0x5412;
}

function drawFormatBits(matrix: Matrix, reserved: Matrix) {
  const bits = getFormatBits();
  for (let i = 0; i <= 5; i++) setModule(matrix, reserved, 8, i, getBit(bits, i));
  setModule(matrix, reserved, 8, 7, getBit(bits, 6));
  setModule(matrix, reserved, 8, 8, getBit(bits, 7));
  setModule(matrix, reserved, 7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i++) setModule(matrix, reserved, 14 - i, 8, getBit(bits, i));

  for (let i = 0; i < 8; i++) setModule(matrix, reserved, SIZE - 1 - i, 8, getBit(bits, i));
  for (let i = 8; i < 15; i++) setModule(matrix, reserved, 8, SIZE - 15 + i, getBit(bits, i));
  setModule(matrix, reserved, 8, SIZE - 8, true);
}

function maskBit(x: number, y: number) {
  return (x + y) % 2 === 0;
}

function drawData(matrix: Matrix, reserved: Matrix, codewords: number[]) {
  const bits = codewords.flatMap(byte =>
    Array.from({ length: 8 }, (_, i) => (byte >>> (7 - i)) & 1)
  );
  let bitIndex = 0;
  let upward = true;

  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right--;
    for (let vertical = 0; vertical < SIZE; vertical++) {
      const y = upward ? SIZE - 1 - vertical : vertical;
      for (let offset = 0; offset < 2; offset++) {
        const x = right - offset;
        if (reserved[y][x]) continue;
        const raw = bitIndex < bits.length && bits[bitIndex] === 1;
        matrix[y][x] = raw !== maskBit(x, y);
        bitIndex++;
      }
    }
    upward = !upward;
  }
}

export function createQrMatrix(text: string) {
  const data = encodeData(text);
  const codewords = [...data, ...reedSolomonRemainder(data, ECC_CODEWORDS)];
  const { modules, reserved } = createEmptyMatrix();
  drawFunctionPatterns(modules, reserved);
  drawData(modules, reserved, codewords);
  drawFormatBits(modules, reserved);
  return modules;
}

export function createQrPath(matrix: Matrix) {
  const commands: string[] = [];
  matrix.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) commands.push(`M${x},${y}h1v1h-1z`);
    });
  });
  return commands.join("");
}
