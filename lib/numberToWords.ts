
const defaultNumbers = ' hai ba bốn năm sáu bảy tám chín';

const units = ('1 một' + defaultNumbers).split(' ');
const ch = 'lẻ mười' + defaultNumbers;
const tr = 'không một' + defaultNumbers;
const tram = tr.split(' ');
const u = '2 nghìn triệu tỷ'.split(' ');
const v1 = '1 một' + defaultNumbers;
const v2 = '2 hai' + defaultNumbers;
const v3 = '3 ba' + defaultNumbers;
const v4 = '4 bốn' + defaultNumbers;
const v5 = '5 năm' + defaultNumbers;
const v6 = '6 sáu' + defaultNumbers;
const v7 = '7 bảy' + defaultNumbers;
const v8 = '8 tám' + defaultNumbers;
const v9 = '9 chín' + defaultNumbers;
const v = [v1, v2, v3, v4, v5, v6, v7, v8, v9];

function readGroup(group: string) {
    let readgroup = '';
    const temp = group.split('');
    const len = temp.length;
    const number = [0, 0, 0];

    // Parse into array of 3 digits
    for (let i = 0; i < len; i++) {
        number[2 - i] = parseInt(temp[len - 1 - i]);
    }

    // Read hundreds
    if (number[0] === 0 && number[1] === 0 && number[2] === 0) return '';

    if (number[0] !== 0) {
        readgroup += tram[number[0]] + ' trăm ';
    } else if (len === 3) { // Only read "không trăm" if it's a full 3-digit group
        readgroup += 'không trăm ';
    }

    // Read tens
    if (number[1] === 0) {
        if (number[0] !== 0 && number[2] !== 0) readgroup += 'lẻ ';
    } else if (number[1] === 1) {
        readgroup += 'mười ';
    } else {
        readgroup += tram[number[1]] + ' mươi ';
    }

    // Read units
    if (number[2] === 0) return readgroup;

    if (number[2] === 1) {
        if (number[1] !== 0 && number[1] !== 1) {
            readgroup += 'mốt ';
        } else {
            readgroup += 'một ';
        }
    } else if (number[2] === 5) {
        if (number[1] !== 0) {
            readgroup += 'lăm ';
        } else {
            readgroup += 'năm ';
        }
    } else {
        readgroup += tram[number[2]] + ' ';
    }

    return readgroup;
}

export function readMoney(money: string | number): string {
    if (!money) return '';
    let str = money.toString();

    // Handle negative numbers
    let prefix = '';
    if (str.startsWith('-')) {
        prefix = 'âm ';
        str = str.substring(1);
    }

    // Remove non-digits
    str = str.replace(/\D/g, '');
    if (str === '0') return 'không đồng';

    const length = str.length;
    let result = '';
    let i = 0;
    let j = 0;
    const group = [];

    // Split into groups of 3
    while (i < length) {
        const end = length - i;
        const start = end - 3 > 0 ? end - 3 : 0;
        group[j] = str.slice(start, end);
        i += 3;
        j++;
    }

    // Read each group
    for (let k = group.length - 1; k >= 0; k--) {
        const read = readGroup(group[k]);
        if (read !== '') {
            result += read + (k > 0 ? u[k] + ' ' : '');
        }
    }

    // Clean up spaces
    result = result.trim().replace(/\s+/g, ' ');

    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);

    return prefix + result + ' đồng';
}
