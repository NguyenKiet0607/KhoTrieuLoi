
const DOCSO = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const CHUC = ["linh", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
const DONVI = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

function docSo3ChuSo(n: number): string {
    let tram = Math.floor(n / 100);
    let chuc = Math.floor((n % 100) / 10);
    let donvi = n % 10;
    let ketQua = "";

    if (tram === 0 && chuc === 0 && donvi === 0) return "";

    if (tram !== 0) {
        ketQua += DOCSO[tram] + " trăm ";
        if (chuc === 0 && donvi !== 0) ketQua += "linh ";
    }

    if (chuc !== 0 && chuc !== 1) {
        ketQua += DOCSO[chuc] + " mươi";
        if (chuc === 0 && donvi !== 0) ketQua += " linh ";
    }

    if (chuc === 1) ketQua += "mười";

    switch (donvi) {
        case 1:
            if (chuc !== 0 && chuc !== 1) ketQua += " mốt";
            else ketQua += " " + DOCSO[donvi];
            break;
        case 5:
            if (chuc === 0) ketQua += " " + DOCSO[donvi];
            else ketQua += " lăm";
            break;
        default:
            if (donvi !== 0) ketQua += " " + DOCSO[donvi];
            break;
    }

    return ketQua;
}

export function readMoney(n: number): string {
    if (n === 0) return "không đồng";
    let str = "";
    let i = 0;
    while (n > 0) {
        let so = n % 1000;
        if (so > 0) {
            let s = docSo3ChuSo(so);
            str = s + " " + DONVI[i] + " " + str;
        }
        n = Math.floor(n / 1000);
        i++;
    }
    // Clean up spaces
    str = str.trim();
    // Capitalize first letter
    return str.charAt(0).toUpperCase() + str.slice(1) + " đồng";
}
