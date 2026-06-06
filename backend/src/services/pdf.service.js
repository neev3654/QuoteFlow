const puppeteer = require('puppeteer');

/**
 * Generate PDF buffer for an Invoice document using Puppeteer
 * @param {Object} invoice Fully populated Invoice document
 * @returns {Promise<Buffer>} PDF Buffer
 */
const generateInvoicePDF = async (invoice) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Format fields
    const invoiceDate = invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : 'N/A';
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    };

    // Extract address information
    const getAddressString = (addr) => {
      if (!addr) return '';
      const parts = [addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean);
      return parts.join(', ');
    };

    const vendorAddress = getAddressString(invoice.vendor?.address);
    const currencySign = invoice.currency === 'USD' ? '$' : '₹';

    // Build items rows
    const itemRowsHtml = (invoice.items || []).map((item, index) => `
      <tr class="${index % 2 === 0 ? '' : 'striped'}">
        <td class="text-left font-semibold">${item.itemName}</td>
        <td>${item.hsnCode || '—'}</td>
        <td class="text-right number-font">${item.quantity}</td>
        <td class="text-right number-font">${formatCurrency(item.unitPrice)}</td>
        <td class="text-right number-font">${formatCurrency(item.totalPrice || (item.quantity * item.unitPrice))}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${invoice.invoiceNumber}</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #334155;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 13px;
            line-height: 1.5;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 10px;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.05em;
          }
          .invoice-title {
            text-align: right;
            font-size: 24px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
          }
          .meta-table {
            width: 100%;
            margin-bottom: 25px;
            border-collapse: collapse;
          }
          .meta-table td {
            vertical-align: top;
            width: 50%;
          }
          .meta-table h3 {
            margin-top: 0;
            margin-bottom: 8px;
            font-size: 14px;
            color: #0f172a;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .meta-table p {
            margin: 4px 0;
            color: #475569;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          .details-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            padding: 8px 10px;
            letter-spacing: 0.05em;
          }
          .details-table td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          .details-table tr.striped {
            background-color: #f8fafc;
          }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .number-font {
            font-family: 'Courier New', Courier, monospace;
            font-weight: 600;
          }
          .summary-table {
            width: 40%;
            margin-left: auto;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .summary-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #f1f5f9;
          }
          .summary-table tr.total-row td {
            border-top: 2px solid #0f172a;
            border-bottom: 2px double #0f172a;
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            font-size: 11px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <!-- Header -->
          <table class="header-table">
            <tr>
              <td>
                <span class="logo">QuoteFlow</span>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 11px;">Procurement & Vendor ERP</p>
              </td>
              <td class="invoice-title">
                Invoice
                <p style="margin: 5px 0 0 0; font-size: 13px; font-weight: normal; color: #475569; font-family: monospace;">
                  No: ${invoice.invoiceNumber}
                </p>
              </td>
            </tr>
          </table>

          <!-- Party details / Info -->
          <table class="meta-table">
            <tr>
              <td style="padding-right: 20px;">
                <h3>Bill From</h3>
                <p><strong>QuoteFlow Platforms Ltd.</strong></p>
                <p>Corporate Office, Sector 62</p>
                <p>Noida, Uttar Pradesh, 201301</p>
                <p>Email: finance@quoteflow.com</p>
                <p>Phone: +91 120 44556677</p>
              </td>
              <td style="padding-left: 20px;">
                <h3>Bill To</h3>
                <p><strong>${invoice.vendor?.companyName || 'Vendor Company'}</strong></p>
                <p>Contact: ${invoice.vendor?.contactPerson || 'N/A'}</p>
                <p>Email: ${invoice.vendor?.email || 'N/A'}</p>
                <p>Phone: ${invoice.vendor?.phone || 'N/A'}</p>
                <p>${vendorAddress || 'N/A'}</p>
                ${invoice.vendor?.gstNumber ? `<p>GSTIN: ${invoice.vendor.gstNumber}</p>` : ''}
              </td>
            </tr>
          </table>

          <!-- Meta Dates -->
          <table class="meta-table" style="margin-bottom: 15px;">
            <tr>
              <td>
                <h3>Invoice Reference</h3>
                <p>Invoice Date: <strong>${invoiceDate}</strong></p>
                <p>Due Date: <strong style="color: #dc2626;">${dueDate}</strong></p>
                <p>PO Ref: <strong>${invoice.purchaseOrder?.poNumber || 'N/A'}</strong></p>
              </td>
              <td>
                <h3>Payment Details</h3>
                <p>Status: <span style="text-transform: uppercase; font-weight: bold;">${invoice.status}</span></p>
                ${invoice.paymentMethod ? `<p>Method: ${invoice.paymentMethod}</p>` : ''}
                ${invoice.paidAt ? `<p>Paid At: ${new Date(invoice.paidAt).toLocaleDateString('en-IN')}</p>` : ''}
              </td>
            </tr>
          </table>

          <!-- Items Table -->
          <table class="details-table">
            <thead>
              <tr>
                <th class="text-left">Item Name</th>
                <th style="width: 100px;">HSN Code</th>
                <th class="text-right" style="width: 70px;">Qty</th>
                <th class="text-right" style="width: 110px;">Unit Price (${currencySign})</th>
                <th class="text-right" style="width: 130px;">Total Price (${currencySign})</th>
              </tr>
            </thead>
            <tbody>
              ${itemRowsHtml}
            </tbody>
          </table>

          <!-- Summary & Tax -->
          <table class="summary-table">
            <tr>
              <td class="text-left">Subtotal</td>
              <td class="text-right number-font">${formatCurrency(invoice.subtotal)}</td>
            </tr>
            ${invoice.cgstRate > 0 ? `
              <tr>
                <td class="text-left">CGST (${invoice.cgstRate}%)</td>
                <td class="text-right number-font">${formatCurrency(invoice.cgstAmount)}</td>
              </tr>
            ` : ''}
            ${invoice.sgstRate > 0 ? `
              <tr>
                <td class="text-left">SGST (${invoice.sgstRate}%)</td>
                <td class="text-right number-font">${formatCurrency(invoice.sgstAmount)}</td>
              </tr>
            ` : ''}
            ${invoice.igstRate > 0 ? `
              <tr>
                <td class="text-left">IGST (${invoice.igstRate}%)</td>
                <td class="text-right number-font">${formatCurrency(invoice.igstAmount)}</td>
              </tr>
            ` : ''}
            <tr>
              <td class="text-left">Total Tax</td>
              <td class="text-right number-font">${formatCurrency(invoice.totalTax)}</td>
            </tr>
            <tr class="total-row">
              <td class="text-left">Grand Total (${currencySign})</td>
              <td class="text-right number-font">${formatCurrency(invoice.totalAmount)}</td>
            </tr>
          </table>

          <!-- Footer -->
          <div class="footer">
            Thank you for your business | Generated by QuoteFlow ERP | This is a computer-generated invoice
          </div>
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw new ApiError(500, `PDF Generation failed: ${error.message}`);
  }
};

module.exports = { generateInvoicePDF };
