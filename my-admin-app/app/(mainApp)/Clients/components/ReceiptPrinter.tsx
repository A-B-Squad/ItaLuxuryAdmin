"use client";

import React from "react";

interface ReceiptData {
  brandName: string;
  brandLogo?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  pointsAdded: number;
  newBalance: number;
  purchaseAmount: string;
  description: string;
  date: string;
  transactionId?: string;
}

export const printReceipt = (data: ReceiptData) => {
  // Create a hidden iframe for printing
  const printWindow = window.open('', '_blank', 'width=300,height=600');

  if (!printWindow) {
    alert('Veuillez autoriser les popups pour imprimer le reçu');
    return;
  }

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reçu - ${data.brandName}</title>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Courier New', monospace;
          width: 80mm;
          padding: 10mm;
          background: white;
          color: #000;
          font-size: 12px;
          line-height: 1.4;
        }

        .receipt {
          width: 100%;
        }

        .header {
          text-align: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px dashed #000;
        }

        .logo {
          max-width: 120px;
          max-height: 60px;
          margin: 0 auto 10px;
          display: block;
        }

        .brand-name {
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .receipt-title {
          font-size: 14px;
          font-weight: bold;
          margin: 10px 0;
          text-transform: uppercase;
        }

        .section {
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #000;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 11px;
        }

        .label {
          font-weight: bold;
        }

        .value {
          text-align: right;
        }

        .points-box {
          background: #f5f5f5;
          border: 2px solid #000;
          padding: 10px;
          margin: 15px 0;
          text-align: center;
        }

        .points-added {
          font-size: 24px;
          font-weight: bold;
          margin: 5px 0;
        }

        .new-balance {
          font-size: 16px;
          font-weight: bold;
          margin-top: 5px;
        }

        .footer {
          text-align: center;
          margin-top: 15px;
          font-size: 10px;
        }

        .barcode {
          text-align: center;
          margin: 10px 0;
          font-size: 10px;
          letter-spacing: 2px;
        }

        .thank-you {
          text-align: center;
          font-size: 12px;
          font-weight: bold;
          margin-top: 15px;
          text-transform: uppercase;
        }

        .credentials-box {
          background: #f9f9f9;
          border: 1px solid #000;
          padding: 8px;
          margin: 10px 0;
        }

        .credentials-title {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 5px;
          text-align: center;
        }

        @media print {
          .no-print {
            display: none;
          }
        }

        .print-button {
          width: 100%;
          padding: 10px;
          background: #000;
          color: #fff;
          border: none;
          font-size: 14px;
          cursor: pointer;
          margin-top: 10px;
          font-weight: bold;
        }

        .print-button:hover {
          background: #333;
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <!-- Header -->
        <div class="header">
          ${data.brandLogo ? `<img src="${data.brandLogo}" alt="Logo" class="logo" />` : ''}
          <div class="brand-name">${data.brandName}</div>
          <div style="font-size: 10px;">Programme de Fidélité</div>
             
          <div style="margin-top: 10px; font-size: 9px;">
            <div style="margin-bottom: 3px;">🌐 www.ita-luxury.com</div>
            <div style="margin-bottom: 3px;">📷 Instagram: @ita.luxury</div>
            <div style="margin-bottom: 3px;">📘 Facebook: ITA Luxury</div>
          </div>
        </div>

        <!-- Receipt Title -->
        <div class="receipt-title" style="text-align: center;">
          🎁 REÇU DE POINTS 🎁
        </div>

        <!-- Date & Transaction -->
        <div class="section">
          <div class="row">
            <span class="label">Date:</span>
            <span class="value">${data.date}</span>
          </div>
          ${data.transactionId ? `
          <div class="row">
            <span class="label">Transaction:</span>
            <span class="value">#${data.transactionId}</span>
          </div>
          ` : ''}
        </div>

        <!-- Customer Info -->
        <div class="section">
          <div style="font-weight: bold; margin-bottom: 5px; font-size: 12px;">CLIENT:</div>
          <div class="row">
            <span class="label">Nom:</span>
            <span class="value">${data.userName}</span>
          </div>
          <div class="row">
            <span class="label">Email:</span>
            <span class="value" style="font-size: 9px;">${data.userEmail}</span>
          </div>
          <div class="row">
            <span class="label">Tél:</span>
            <span class="value">${data.userPhone}</span>
          </div>
        </div>


        <!-- Purchase Info -->
        <div class="section">
          <div style="font-weight: bold; margin-bottom: 5px; font-size: 12px;">ACHAT:</div>
          <div class="row">
            <span class="label">Montant:</span>
            <span class="value" style="font-size: 14px; font-weight: bold;">${data.purchaseAmount}</span>
          </div>
          ${data.description ? `
          <div style="font-size: 10px; margin-top: 5px; font-style: italic;">
            ${data.description}
          </div>
          ` : ''}
        </div>

        <!-- Points Box -->
        <div class="points-box">
          <div style="font-size: 11px;">POINTS GAGNÉS</div>
          <div class="points-added">+${data.pointsAdded.toLocaleString()}</div>
          <div style="margin: 10px 0; border-top: 1px solid #000; padding-top: 8px;">
            <div style="font-size: 11px;">NOUVEAU SOLDE</div>
            <div class="new-balance">${data.newBalance.toLocaleString()} PTS</div>
          </div>
        </div>

        <!-- Barcode/Transaction ID -->
        ${data.transactionId ? `
        <div class="barcode">
          ||||| ${data.transactionId.substring(0, 12).toUpperCase()} |||||
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <div style="margin-bottom: 5px;">━━━━━━━━━━━━━━━━━━━━━━</div>
          <div style="margin-bottom: 3px;">Merci pour votre fidélité!</div>
          <div style="font-size: 9px;">Conservez ce reçu</div>
       
        </div>

        <div class="thank-you">
          ★ À bientôt! ★
        </div>

        <!-- Print Button (hidden when printing) -->
        <button class="print-button no-print" onclick="window.print()">
          🖨️ IMPRIMER LE REÇU
        </button>
      </div>

      <script>
        // Auto-print when page loads (optional)
        window.onload = function() {
          // Uncomment the line below to auto-print
          // window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(receiptHTML);
  printWindow.document.close();
};

// Example usage component
export const ReceiptPrinter: React.FC<{ data: ReceiptData }> = ({ data }) => {
  return (
    <button
      onClick={() => printReceipt(data)}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center"
    >
      🖨️ Imprimer Reçu
    </button>
  );
};