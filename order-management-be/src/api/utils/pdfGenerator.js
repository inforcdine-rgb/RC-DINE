import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const createInvoicePdf = async ({
    title = '',
    hotelId = '',
    invoiceNumber = '',
    orderId = '',
    date = '',
    customerName = '',
    customerId = '',
    tableNumber = '',
    tableData = [],
    totalAmount = '',
    paymentMode = '',
    razorpayPaymentId = '',
    discountType = '',
    discountValue = 0,
    discountAmount = 0
}) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const contentFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(String(title), {
        x: 50,
        y: height - 50,
        size: 20,
        font: titleFont,
        color: rgb(0, 0, 0)
    });

    const invoiceDetails = [
        { label: 'Hotel ID:', value: String(hotelId) },
        { label: 'Order Number:', value: String(invoiceNumber) },
        { label: 'Date & Time:', value: String(date) },
        { label: 'Table Number:', value: String(tableNumber) },
        { label: 'Payment Mode:', value: String(paymentMode) },
        { label: 'Payment ID/Ref:', value: String(razorpayPaymentId) }
    ];

    let y = height - 90;
    const detailsX = 50;
    const labelX = detailsX;
    const valueX = detailsX + 120;

    invoiceDetails.forEach(({ label, value }) => {
        page.drawText(label, {
            x: labelX,
            y,
            size: 10,
            font: contentFont,
            color: rgb(0, 0, 0)
        });

        page.drawText(value, {
            x: valueX,
            y,
            size: 10,
            font: contentFont,
            color: rgb(0, 0, 0)
        });

        y -= 15;
    });

    const columnWidths = [250, 100, 100];
    const rowHeight = 30;
    const tableStartY = y - 20;

    y = tableStartY;

    page.drawRectangle({
        x: 50,
        y: y - rowHeight,
        width: width - 100,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
        color: rgb(0.9, 0.9, 0.9)
    });

    if (tableData?.[0]) {
        tableData[0].forEach((header, i) => {
            page.drawText(String(header), {
                x: 50 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + 10,
                y: y - 20,
                size: 14,
                font: contentFont,
                color: rgb(0, 0, 0)
            });
        });
    }

    y -= rowHeight;

    tableData.slice(1).forEach((row, rowIndex) => {
        const bgColor = rowIndex % 2 === 0 ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1);

        page.drawRectangle({
            x: 50,
            y: y - rowHeight,
            width: width - 100,
            height: rowHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
            color: bgColor
        });

        row.forEach((cell, cellIndex) => {
            page.drawText(String(cell), {
                x: 50 + columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0) + 10,
                y: y - 20,
                size: 12,
                font: contentFont,
                color: rgb(0, 0, 0)
            });
        });

        y -= rowHeight;
    });

    const parsedDiscountAmount = Number(discountAmount || 0);
    const parsedDiscountValue = Number(discountValue || 0);

    if (parsedDiscountAmount > 0) {
        const discountLabel =
            discountType === 'PERCENT'
                ? `Discount (${parsedDiscountValue}%): -${parsedDiscountAmount}rs`
                : `Discount: -${parsedDiscountAmount}rs`;

        page.drawText(discountLabel, {
            x: 50,
            y: y - 40,
            size: 12,
            font: contentFont,
            color: rgb(0, 0, 0)
        });

        y -= 20;
    }

    page.drawText(`Total Amount: ${totalAmount}rs`, {
        x: 50,
        y: y - 40,
        size: 12,
        font: contentFont,
        color: rgb(0, 0, 0)
    });

    page.drawText('Thank you for dining with us!', {
        x: 50,
        y: 50,
        size: 12,
        font: contentFont,
        color: rgb(0, 0, 0)
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};
