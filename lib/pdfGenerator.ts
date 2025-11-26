// PDF Generator utility using jsPDF
// This will be used client-side to generate PDFs

// Helper to add company header
const addHeader = (doc: any, title: string) => {
    // Company Name
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185); // Blue color
    doc.text('KHO TRIỀU LỢI', 105, 20, { align: 'center' });

    // Company Info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Gray color
    doc.text('Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM', 105, 28, { align: 'center' });
    doc.text('Điện thoại: (028) 1234 5678 - Email: contact@triuloi.vn', 105, 34, { align: 'center' });

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 40, 190, 40);

    // Document Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(title.toUpperCase(), 105, 55, { align: 'center' });
};

// Helper to add footer
const addFooter = (doc: any) => {
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Trang ${i} / ${pageCount}`, 190, 287, { align: 'right' });
        doc.text(`Ngày in: ${new Date().toLocaleString('vi-VN')}`, 20, 287, { align: 'left' });
    }
};

import { readMoney } from '@/lib/readMoney';

// ... imports

export async function generateOrderPDF(orderId: string, token: string) {
    try {
        const response = await fetch(`/api/orders/${orderId}/pdf`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch order data');
        }

        const data = await response.json();

        // Dynamic import jsPDF
        const { default: jsPDF } = await import('jspdf');
        // We don't need autotable for this specific layout anymore, but keeping it for others
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        const { order } = data;

        // --- 1. Header Left (Company Info) ---
        doc.setFontSize(11);
        doc.setFont("times", "bold");
        doc.text("CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ TRIỀU LỢI", 10, 20);

        doc.setFont("times", "normal");
        doc.setFontSize(10);
        doc.text("525/15/21 Lê Trọng Tấn, Phường Tây Thạnh, Thành phố HCM", 10, 25);
        doc.text("028 625 99771 - 028 625 99973 - 0358 768 434", 10, 30);

        // --- 2. Header Right (Template Info) ---
        const rightX = 130;
        doc.setFont("times", "bold");
        doc.text("Mẫu số: 01 - TT", rightX, 20);

        doc.setFont("times", "italic");
        doc.setFontSize(9);
        doc.text("(Ban hành theo TT số: 200/2014/QĐ-BTC", rightX, 25);
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
        // Construct reason from items
        const firstItem = order.OrderItem[0];
        let reason = `Thu tiền ${firstItem?.quantity || 0} x ${firstItem?.Product?.name || 'Sản phẩm'}`;
        if (order.OrderItem.length > 1) {
            reason += ` và ${order.OrderItem.length - 1} sản phẩm khác`;
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
        doc.save(`phieu-thu-${order.code}.pdf`);

        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
}

export async function generateReceiptPDF(receiptId: string, token: string) {
    try {
        const response = await fetch(`/api/receipts/${receiptId}/pdf`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        const { receipt, title } = data;

        addHeader(doc, title);

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Mã phiếu:`, 20, 70);
        doc.setFont('helvetica', 'bold');
        doc.text(receipt.code, 50, 70);
        doc.setFont('helvetica', 'normal');

        doc.text(`Nhà cung cấp:`, 20, 80);
        doc.setFont('helvetica', 'bold');
        doc.text(receipt.supplier, 50, 80);
        doc.setFont('helvetica', 'normal');

        doc.text(`Ngày nhập:`, 120, 70);
        doc.text(new Date(receipt.date).toLocaleDateString('vi-VN'), 150, 70);

        const tableData = receipt.StockReceiptItem.map((item: any, index: number) => [
            index + 1,
            item.StockItem.Product.name,
            item.StockItem.Warehouse.name,
            item.quantity,
            item.StockItem.Product.unit,
            item.price.toLocaleString('vi-VN'),
            item.amount.toLocaleString('vi-VN'),
        ]);

        autoTable(doc, {
            startY: 90,
            head: [['STT', 'Sản phẩm', 'Kho', 'Số lượng', 'Đơn vị', 'Đơn giá', 'Thành tiền']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { font: 'helvetica', fontSize: 10 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                3: { halign: 'center', cellWidth: 20 },
                4: { halign: 'center', cellWidth: 20 },
                5: { halign: 'right', cellWidth: 30 },
                6: { halign: 'right', cellWidth: 35 },
            },
        });

        const finalY = (doc as any).lastAutoTable.finalY || 90;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Tổng cộng:`, 140, finalY + 15);
        doc.setTextColor(192, 57, 43);
        doc.text(`${receipt.totalAmount.toLocaleString('vi-VN')} đ`, 190, finalY + 15, { align: 'right' });

        addFooter(doc);
        doc.save(`phieu-nhap-${receipt.code}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
}

export async function generateIssuePDF(issueId: string, token: string) {
    try {
        const response = await fetch(`/api/issues/${issueId}/pdf`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        const { issue, title } = data;

        addHeader(doc, title);

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Mã phiếu:`, 20, 70);
        doc.setFont('helvetica', 'bold');
        doc.text(issue.code, 50, 70);
        doc.setFont('helvetica', 'normal');

        doc.text(`Người nhận:`, 20, 80);
        doc.setFont('helvetica', 'bold');
        doc.text(issue.receiver, 50, 80);
        doc.setFont('helvetica', 'normal');

        doc.text(`Ngày xuất:`, 120, 70);
        doc.text(new Date(issue.date).toLocaleDateString('vi-VN'), 150, 70);

        const tableData = issue.StockIssueItem.map((item: any, index: number) => [
            index + 1,
            item.StockItem.Product.name,
            item.StockItem.Warehouse.name,
            item.quantity,
            item.StockItem.Product.unit,
            item.price.toLocaleString('vi-VN'),
            item.amount.toLocaleString('vi-VN'),
        ]);

        autoTable(doc, {
            startY: 90,
            head: [['STT', 'Sản phẩm', 'Kho', 'Số lượng', 'Đơn vị', 'Đơn giá', 'Thành tiền']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { font: 'helvetica', fontSize: 10 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                3: { halign: 'center', cellWidth: 20 },
                4: { halign: 'center', cellWidth: 20 },
                5: { halign: 'right', cellWidth: 30 },
                6: { halign: 'right', cellWidth: 35 },
            },
        });

        const finalY = (doc as any).lastAutoTable.finalY || 90;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Tổng cộng:`, 140, finalY + 15);
        doc.setTextColor(192, 57, 43);
        doc.text(`${issue.totalAmount.toLocaleString('vi-VN')} đ`, 190, finalY + 15, { align: 'right' });

        addFooter(doc);
        doc.save(`phieu-xuat-${issue.code}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
}

export async function generateTransferPDF(transferId: string, token: string) {
    try {
        const response = await fetch(`/api/transfers/${transferId}/pdf`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        const { transfer, title } = data;

        addHeader(doc, title);

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Mã phiếu:`, 20, 70);
        doc.setFont('helvetica', 'bold');
        doc.text(transfer.code, 50, 70);
        doc.setFont('helvetica', 'normal');

        doc.text(`Từ kho:`, 20, 80);
        doc.setFont('helvetica', 'bold');
        doc.text(transfer.Warehouse_StockTransfer_fromWarehouseIdToWarehouse.name, 50, 80);
        doc.setFont('helvetica', 'normal');

        doc.text(`Đến kho:`, 20, 90);
        doc.setFont('helvetica', 'bold');
        doc.text(transfer.Warehouse_StockTransfer_toWarehouseIdToWarehouse.name, 50, 90);
        doc.setFont('helvetica', 'normal');

        doc.text(`Ngày chuyển:`, 120, 70);
        doc.text(new Date(transfer.date).toLocaleDateString('vi-VN'), 150, 70);

        const tableData = transfer.StockTransferItem.map((item: any, index: number) => [
            index + 1,
            item.Product.name,
            item.quantityOut,
            item.quantityIn,
            item.Product.unit,
            item.price.toLocaleString('vi-VN'),
            item.amount.toLocaleString('vi-VN'),
        ]);

        autoTable(doc, {
            startY: 100,
            head: [['STT', 'Sản phẩm', 'SL xuất', 'SL nhập', 'Đơn vị', 'Đơn giá', 'Thành tiền']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { font: 'helvetica', fontSize: 10 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                2: { halign: 'center', cellWidth: 20 },
                3: { halign: 'center', cellWidth: 20 },
                4: { halign: 'center', cellWidth: 20 },
                5: { halign: 'right', cellWidth: 25 },
                6: { halign: 'right', cellWidth: 30 },
            },
        });

        const finalY = (doc as any).lastAutoTable.finalY || 100;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Tổng cộng:`, 140, finalY + 15);
        doc.setTextColor(192, 57, 43);
        doc.text(`${transfer.totalAmount.toLocaleString('vi-VN')} đ`, 190, finalY + 15, { align: 'right' });

        addFooter(doc);
        doc.save(`phieu-chuyen-${transfer.code}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
}
