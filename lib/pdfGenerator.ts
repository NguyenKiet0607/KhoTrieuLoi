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

        // Dynamic import jsPDF to avoid SSR issues
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        const { order, title } = data;

        // Add Header
        addHeader(doc, title);

        // Add order info
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Mã đơn hàng:`, 20, 70);
        doc.setFont(undefined, 'bold');
        doc.text(order.code, 50, 70);
        doc.setFont(undefined, 'normal');

        doc.text(`Khách hàng:`, 20, 80);
        doc.setFont(undefined, 'bold');
        doc.text(order.customer, 50, 80);
        doc.setFont(undefined, 'normal');

        doc.text(`Ngày tạo:`, 120, 70);
        doc.text(new Date(order.date).toLocaleDateString('vi-VN'), 150, 70);

        // Add items table
        const tableData = order.OrderItem.map((item: any, index: number) => [
            index + 1,
            item.Product.name,
            item.quantity,
            item.Product.unit,
            item.price.toLocaleString('vi-VN'),
            item.amount.toLocaleString('vi-VN'),
        ]);

        autoTable(doc, {
            startY: 90,
            head: [['STT', 'Sản phẩm', 'Số lượng', 'Đơn vị', 'Đơn giá', 'Thành tiền']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { font: 'helvetica', fontSize: 10 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                2: { halign: 'center', cellWidth: 20 },
                3: { halign: 'center', cellWidth: 20 },
                4: { halign: 'right', cellWidth: 30 },
                5: { halign: 'right', cellWidth: 35 },
            },
        });

        // Add total
        const finalY = (doc as any).lastAutoTable.finalY || 90;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Tổng cộng:`, 140, finalY + 15);
        doc.setTextColor(192, 57, 43); // Red color
        doc.text(`${order.totalAmount.toLocaleString('vi-VN')} đ`, 190, finalY + 15, { align: 'right' });

        // Add Footer
        addFooter(doc);

        // Save PDF
        doc.save(`don-hang-${order.code}.pdf`);

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
        doc.setFont(undefined, 'bold');
        doc.text(receipt.code, 50, 70);
        doc.setFont(undefined, 'normal');

        doc.text(`Nhà cung cấp:`, 20, 80);
        doc.setFont(undefined, 'bold');
        doc.text(receipt.supplier, 50, 80);
        doc.setFont(undefined, 'normal');

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
        doc.setFont(undefined, 'bold');
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
        doc.setFont(undefined, 'bold');
        doc.text(issue.code, 50, 70);
        doc.setFont(undefined, 'normal');

        doc.text(`Người nhận:`, 20, 80);
        doc.setFont(undefined, 'bold');
        doc.text(issue.receiver, 50, 80);
        doc.setFont(undefined, 'normal');

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
        doc.setFont(undefined, 'bold');
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
        doc.setFont(undefined, 'bold');
        doc.text(transfer.code, 50, 70);
        doc.setFont(undefined, 'normal');

        doc.text(`Từ kho:`, 20, 80);
        doc.setFont(undefined, 'bold');
        doc.text(transfer.Warehouse_StockTransfer_fromWarehouseIdToWarehouse.name, 50, 80);
        doc.setFont(undefined, 'normal');

        doc.text(`Đến kho:`, 20, 90);
        doc.setFont(undefined, 'bold');
        doc.text(transfer.Warehouse_StockTransfer_toWarehouseIdToWarehouse.name, 50, 90);
        doc.setFont(undefined, 'normal');

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
        doc.setFont(undefined, 'bold');
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
