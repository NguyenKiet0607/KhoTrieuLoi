import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import { readMoney } from '@/lib/readMoney';

export async function generateAndSaveOrderPDF(order: any) {
    try {
        // Define the target directory
        const targetDir = 'H:\\My Drive\\Tổng Hợp Các Chứng Từ\\orders';

        // Ensure directory exists
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const doc = new jsPDF();

        // --- Watermark Logo ---
        try {
            const logoPath = path.join(process.cwd(), 'public', 'logo', 'logo.png');
            if (fs.existsSync(logoPath)) {
                const logoData = fs.readFileSync(logoPath);
                // Add logo centered, large
                doc.addImage(logoData, 'PNG', 55, 100, 100, 100, undefined, 'FAST');
            }
        } catch (e) {
            console.error("Error adding logo:", e);
        }

        // --- 1. Header Left (Company Info) ---
        doc.setFontSize(11);
        doc.setFont("times", "bold");
        doc.text("CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ TRIỀU LỢI", 10, 20);

        doc.setFont("times", "normal");
        doc.setFontSize(10);
        doc.text("525/15/21 Lê Trọng Tấn, Phường Tây Thạnh, Thành phố HCM", 10, 25);
        doc.text("ĐT: 028 625 99973 - 0358 768 434", 10, 30);

        // --- 2. Header Right (Template Info) ---
        const rightX = 130;
        doc.setFont("times", "bold");
        doc.text("Mẫu số: 01 - TT", rightX, 20);

        doc.setFont("times", "italic");
        doc.setFontSize(9);
        doc.text("(Ban hành theo TT số: 200/2014/QĐ8-BTC", rightX, 25);
        doc.text("Ngày 20/3/2006 của Bộ trưởng BTC)", rightX, 30);

        doc.setFont("times", "normal");
        doc.setFontSize(10);
        doc.text("Quyển số: ....................", rightX, 38);
        doc.text(`Số: ${order.code}`, rightX, 43);

        // --- 3. Title ---
        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.text("PHIẾU THU", 105, 55, { align: "center" });

        // --- 4. Date ---
        const date = new Date(order.date);
        doc.setFont("times", "italic");
        doc.setFontSize(11);
        doc.text(`Ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`, 105, 62, { align: "center" });

        // --- 5. Body Content ---
        const startY = 80;
        const labelX = 20;
        const valueX = 80;
        const lineHeight = 10;

        doc.setFont("times", "normal");
        doc.setFontSize(12);

        // Customer
        doc.text("- Họ và tên người nộp tiền :", labelX, startY);
        doc.setFont("times", "bold");
        doc.text(order.customer, valueX, startY);

        // Address
        doc.setFont("times", "normal");
        doc.text("- Địa chỉ :", labelX, startY + lineHeight);
        doc.text(order.address || "..................................................................", valueX, startY + lineHeight);

        // Reason
        const firstItem = order.OrderItem && order.OrderItem[0];
        let productName = 'Sản phẩm';
        if (firstItem && firstItem.Product) {
            productName = firstItem.Product.name;
        } else if (order.items && order.items[0] && order.items[0].productName) {
            productName = order.items[0].productName;
        }

        let reason = `Thu tiền ${firstItem?.quantity || 0} x ${productName}`;
        if (order.OrderItem && order.OrderItem.length > 1) {
            reason += ` và ${order.OrderItem.length - 1} sản phẩm khác`;
        } else if (order.items && order.items.length > 1) {
            reason += ` và ${order.items.length - 1} sản phẩm khác`;
        }

        doc.text("- Lý do thu :", labelX, startY + lineHeight * 2);
        doc.text(reason, valueX, startY + lineHeight * 2);

        // Amount
        doc.text("- Số tiền :", labelX, startY + lineHeight * 3);
        doc.setFont("times", "bold");
        doc.text(`${order.totalAmount.toLocaleString('vi-VN')} đ`, valueX, startY + lineHeight * 3);

        // Amount in words
        doc.setFont("times", "normal");
        doc.text("- Bằng chữ :", labelX, startY + lineHeight * 4);
        doc.setFont("times", "italic");
        const moneyText = readMoney(order.totalAmount);
        doc.text(`(${moneyText})`, valueX, startY + lineHeight * 4);

        // Attached
        doc.setFont("times", "normal");
        doc.text("- Kèm theo :", labelX, startY + lineHeight * 5);
        doc.setFont("times", "bold");
        doc.text("Chứng từ gốc", valueX, startY + lineHeight * 5);

        // --- 6. Signatures ---
        const sigY = startY + lineHeight * 7;
        doc.setFont("times", "bold");
        doc.setFontSize(11);

        const sigYTitle = sigY;

        doc.text("Giám đốc", 30, sigYTitle, { align: "center" });
        doc.text("Kế toán trưởng", 70, sigYTitle, { align: "center" });
        doc.text("Thủ quỹ", 110, sigYTitle, { align: "center" });
        doc.text("Người lập phiếu", 150, sigYTitle, { align: "center" });
        doc.text("Người nộp tiền", 190, sigYTitle, { align: "center" });

        // --- 7. Footer ---
        const footerY = 250;
        doc.setFont("times", "normal");
        doc.setFontSize(10);

        doc.text("- Đã nhận đủ số tiền (Viết bằng chữ):", 20, footerY);
        doc.setFont("times", "italic");
        doc.text(moneyText, 80, footerY);

        doc.setFont("times", "normal");
        doc.text("- Tỷ giá ngoại tệ (Vàng, bạc, đá quý):", 20, footerY + 6);
        doc.text("................................................", 80, footerY + 6);

        doc.text("- Số tiền quy đổi:", 20, footerY + 12);
        doc.text("................................................", 80, footerY + 12);

        // Save PDF
        const fileName = `phieu-thu-${order.code}.pdf`;
        const filePath = path.join(targetDir, fileName);

        // Output as arraybuffer
        const pdfOutput = doc.output('arraybuffer');
        fs.writeFileSync(filePath, Buffer.from(pdfOutput));

        console.log(`PDF saved to: ${filePath}`);
        return true;
    } catch (error) {
        console.error('Error generating server-side PDF:', error);
        return false;
    }
}
