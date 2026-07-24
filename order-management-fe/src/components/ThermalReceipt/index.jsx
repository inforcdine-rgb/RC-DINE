import React from 'react';
import PropTypes from 'prop-types';

import '../../assets/styles/thermalReceipt.css';

const money = (value) => Number(value || 0).toFixed(2);
const paymentLabel = (value) => String(value || '-').toUpperCase();

function ThermalReceipt({ receipt, printerWidth = '58' }) {
    if (!receipt) return null;

    const isCash = paymentLabel(receipt.paymentMethod) === 'CASH';
    const footerMessage = receipt.footerMessage || 'Thank you! Visit again.';

    return (
        <section className={`thermal-receipt receipt-${printerWidth}`} id="thermal-receipt">
            <header className="thermal-center">
                {receipt.logo ? <img className="thermal-logo" src={receipt.logo} alt="Hotel logo" /> : null}
                <h1>{receipt.hotelName || 'R&C DINE'}</h1>
                <b>TAX INVOICE</b>
                {receipt.address ? <p>{receipt.address}</p> : null}
                {receipt.phone ? <p>Phone: {receipt.phone}</p> : null}
                {receipt.gstNumber ? <p>GSTIN: {receipt.gstNumber}</p> : null}
            </header>

            <div className="thermal-rule" />
            <div className="thermal-meta">
                <p><span>Bill No</span><b>{receipt.orderNumber || '-'}</b></p>
                <p><span>Order Type</span><b>{receipt.orderType || '-'}</b></p>
                <p><span>Table</span><b>{receipt.tableNumber || '-'}</b></p>
                <p><span>Customer</span><b>{receipt.customerName || 'Guest'}</b></p>
                <p><span>Date</span><b>{receipt.dateTime || '-'}</b></p>
                <p><span>Cashier</span><b>{receipt.cashierName || 'Manager'}</b></p>
            </div>

            <div className="thermal-rule" />
            <div className="thermal-items-four thermal-items-head">
                <span>Item</span><span>Qty</span><span>Rate</span><span>Amount</span>
            </div>
            {(receipt.items || []).map((item, index) => {
                const qty = Number(item.quantity || 0);
                const rate = Number(item.unitPrice ?? item.rate ?? item.price ?? 0);
                const amount = Number(item.itemPrice ?? item.amount ?? (rate * qty));
                return (
                    <div className="thermal-items-four thermal-item" key={`${item.menuId || item.id || item.name || index}-${index}`}>
                        <span>{item.itemName || item.menuName || item.name || 'Item'}</span>
                        <span>{qty}</span>
                        <span>{money(rate)}</span>
                        <span>{money(amount)}</span>
                    </div>
                );
            })}

            <div className="thermal-rule" />
            <div className="thermal-totals">
                <p><span>Subtotal</span><b>₹{money(receipt.subtotal)}</b></p>
                {Number(receipt.discountAmount || 0) > 0 ? <p><span>Discount</span><b>-₹{money(receipt.discountAmount)}</b></p> : null}
                {Number(receipt.cgst || 0) > 0 ? <p><span>CGST</span><b>₹{money(receipt.cgst)}</b></p> : null}
                {Number(receipt.sgst || 0) > 0 ? <p><span>SGST</span><b>₹{money(receipt.sgst)}</b></p> : null}
                {Number(receipt.tipAmount || 0) > 0 ? <p><span>Tip</span><b>₹{money(receipt.tipAmount)}</b></p> : null}
                <p className="thermal-grand"><span>Grand Total</span><b>₹{money(receipt.grandTotal)}</b></p>
            </div>

            <div className="thermal-rule" />
            <div className="thermal-meta">
                <p><span>Payment</span><b>{paymentLabel(receipt.paymentMethod)}</b></p>
                {isCash ? <p><span>Received</span><b>₹{money(receipt.cashReceived)}</b></p> : null}
                {isCash ? <p><span>Change</span><b>₹{money(receipt.changeAmount)}</b></p> : null}
            </div>

            <div className="thermal-rule" />
            <footer className="thermal-center thermal-footer">
                <b>THANK YOU</b>
                <p>{footerMessage}</p>
            </footer>
        </section>
    );
}

ThermalReceipt.propTypes = {
    receipt: PropTypes.shape({}).isRequired,
    printerWidth: PropTypes.oneOf(['58', '80', 'auto'])
};

export default ThermalReceipt;
