const { transporter } = require('../config/email');
const ApiError = require('../utils/ApiError');

const EMAIL_FROM = process.env.EMAIL_FROM || '"QuoteFlow" <noreply@quoteflow.com>';

/**
 * Common HTML email layout wrapper with QuoteFlow branding
 */
const getHtmlTemplate = (title, previewText, contentHtml) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: #f8fafc;
          color: #334155;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #e2e8f0;
        }
        .header {
          background-color: #0f172a;
          padding: 32px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.05em;
        }
        .body {
          padding: 40px;
          line-height: 1.6;
        }
        .body h2 {
          color: #0f172a;
          font-size: 20px;
          margin-top: 0;
          margin-bottom: 16px;
        }
        .body p {
          margin-top: 0;
          margin-bottom: 20px;
          color: #475569;
          font-size: 16px;
        }
        .btn {
          display: inline-block;
          background-color: #2563eb;
          color: #ffffff !important;
          padding: 12px 24px;
          text-decoration: none;
          font-weight: 600;
          border-radius: 6px;
          margin-top: 8px;
          margin-bottom: 24px;
          text-align: center;
        }
        .btn:hover {
          background-color: #1d4ed8;
        }
        .info-card {
          background-color: #f1f5f9;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }
        .info-card table {
          width: 100%;
          border-collapse: collapse;
        }
        .info-card table td {
          padding: 6px 0;
          font-size: 14px;
        }
        .info-card table td.label {
          font-weight: 600;
          color: #475569;
          width: 140px;
        }
        .info-card table td.value {
          color: #0f172a;
        }
        .footer {
          background-color: #f8fafc;
          padding: 24px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>QuoteFlow</h1>
        </div>
        <div class="body">
          ${contentHtml}
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} QuoteFlow ERP. All rights reserved.<br>
          This is an automated operational email. Please do not reply directly.
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * 1. sendPasswordReset
 */
const sendPasswordReset = async (user, resetUrl) => {
  try {
    const html = getHtmlTemplate(
      'Reset your QuoteFlow password',
      'Password reset request received',
      `
        <h2>Hello ${user.name},</h2>
        <p>We received a request to reset your password for your QuoteFlow account. Click the button below to set a new password:</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;"><strong>Note:</strong> This link is valid for only 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
      `
    );

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: 'Reset your QuoteFlow password',
      html
    });
  } catch (error) {
    throw new ApiError(500, `Email sending failed: ${error.message}`);
  }
};

/**
 * 2. sendVendorInvitation
 */
const sendVendorInvitation = async (vendor, rfq) => {
  try {
    const formattedDeadline = new Date(rfq.deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const itemsSummaryHtml = rfq.items && rfq.items.length > 0
      ? `<ul>${rfq.items.map(item => `<li><strong>${item.itemName}</strong> (Qty: ${item.quantity} ${item.unit || 'pcs'})</li>`).join('')}</ul>`
      : '<p>Please refer to the RFQ details in the portal.</p>';

    const html = getHtmlTemplate(
      `New RFQ Invitation: ${rfq.title}`,
      `You are invited to bid on RFQ ${rfq.rfqNumber}`,
      `
        <h2>Hello ${vendor.companyName},</h2>
        <p>You have been invited to submit a quotation for the following Request for Quote (RFQ):</p>
        
        <div class="info-card">
          <table>
            <tr>
              <td class="label">RFQ Number</td>
              <td class="value"><strong>${rfq.rfqNumber}</strong></td>
            </tr>
            <tr>
              <td class="label">Title</td>
              <td class="value">${rfq.title}</td>
            </tr>
            <tr>
              <td class="label">Deadline</td>
              <td class="value" style="color: #dc2626; font-weight: 600;">${formattedDeadline}</td>
            </tr>
          </table>
        </div>

        <h3>Items Required:</h3>
        ${itemsSummaryHtml}

        <p>Please log in to your QuoteFlow vendor portal to review the specifications and submit your quotation before the deadline.</p>
      `
    );

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: vendor.email,
      subject: `New RFQ Invitation: ${rfq.title}`,
      html
    });
  } catch (error) {
    throw new ApiError(500, `Email sending failed: ${error.message}`);
  }
};

/**
 * 3. sendApprovalNotification
 */
const sendApprovalNotification = async (approver, rfq, quotation, vendor) => {
  try {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: quotation.currency || 'INR'
    }).format(quotation.totalAmount);

    const html = getHtmlTemplate(
      `Approval Required: ${rfq.title}`,
      `Quotation approval requested for ${rfq.title}`,
      `
        <h2>Hello ${approver.name},</h2>
        <p>A quotation has been submitted and requires your approval to proceed to a Purchase Order:</p>

        <div class="info-card">
          <table>
            <tr>
              <td class="label">RFQ Title</td>
              <td class="value">${rfq.title}</td>
            </tr>
            <tr>
              <td class="label">Vendor</td>
              <td class="value">${vendor.companyName}</td>
            </tr>
            <tr>
              <td class="label">Total Amount</td>
              <td class="value"><strong>${formattedAmount}</strong></td>
            </tr>
          </table>
        </div>

        <p>Please click below to review the quotation details and take action:</p>
        <div style="text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/approvals" class="btn" target="_blank">Review Quotation</a>
        </div>
      `
    );

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: approver.email,
      subject: `Approval Required: ${rfq.title}`,
      html
    });
  } catch (error) {
    throw new ApiError(500, `Email sending failed: ${error.message}`);
  }
};

/**
 * 4. sendApprovalResult
 */
const sendApprovalResult = async (procurementOfficer, quotation, rfq, approved) => {
  try {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: quotation.currency || 'INR'
    }).format(quotation.totalAmount);

    const statusText = approved ? 'Approved' : 'Rejected';
    const statusColor = approved ? '#16a34a' : '#dc2626';

    const html = getHtmlTemplate(
      `Quotation ${statusText}: ${rfq.title}`,
      `The quotation approval workflow is complete`,
      `
        <h2>Hello ${procurementOfficer.name},</h2>
        <p>An approval workflow decision has been finalized for the quotation submitted against <strong>${rfq.title}</strong>:</p>

        <div class="info-card">
          <table>
            <tr>
              <td class="label">Status</td>
              <td class="value" style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${statusText}</td>
            </tr>
            <tr>
              <td class="label">Quotation Amount</td>
              <td class="value">${formattedAmount}</td>
            </tr>
          </table>
        </div>

        ${approved
          ? `<p>The quotation was approved. The next step is to generate a Purchase Order (PO) in the platform.</p>
             <div style="text-align: center;">
               <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/purchase-orders" class="btn" target="_blank">Generate PO</a>
             </div>`
          : '<p>The quotation was rejected. You may review remarks or request alternate quotations.</p>'
        }
      `
    );

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: procurementOfficer.email,
      subject: `Quotation ${statusText}: ${rfq.title}`,
      html
    });
  } catch (error) {
    throw new ApiError(500, `Email sending failed: ${error.message}`);
  }
};

/**
 * 5. sendPOToVendor
 */
const sendPOToVendor = async (vendor, po) => {
  try {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(po.totalAmount);

    const formattedDeliveryDate = po.expectedDeliveryDate
      ? new Date(po.expectedDeliveryDate).toLocaleDateString('en-IN')
      : 'N/A';

    const itemsRows = po.items && po.items.length > 0
      ? po.items.map(item => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${item.itemName}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right;">${item.unitPrice.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right;">${(item.quantity * item.unitPrice).toFixed(2)}</td>
          </tr>
        `).join('')
      : '';

    const html = getHtmlTemplate(
      `Purchase Order Issued: ${po.poNumber}`,
      `Purchase Order ${po.poNumber} has been issued`,
      `
        <h2>Hello ${vendor.companyName},</h2>
        <p>A Purchase Order has been officially generated and issued to your company. Please find the details below:</p>

        <div class="info-card">
          <table>
            <tr>
              <td class="label">PO Number</td>
              <td class="value"><strong>${po.poNumber}</strong></td>
            </tr>
            <tr>
              <td class="label">Expected Delivery</td>
              <td class="value">${formattedDeliveryDate}</td>
            </tr>
            <tr>
              <td class="label">Total Amount</td>
              <td class="value"><strong>${formattedAmount}</strong></td>
            </tr>
          </table>
        </div>

        <h3>Order Summary:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 8px; text-align: left; font-size: 12px; font-weight: 600; color: #475569;">Item</th>
              <th style="padding: 8px; text-align: center; font-size: 12px; font-weight: 600; color: #475569; width: 60px;">Qty</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; font-weight: 600; color: #475569; width: 100px;">Unit Price</th>
              <th style="padding: 8px; text-align: right; font-size: 12px; font-weight: 600; color: #475569; width: 100px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <p>Please log in to your vendor portal to acknowledge receipt and confirm you can fulfill this order by the expected delivery date.</p>
      `
    );

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: vendor.email,
      subject: `Purchase Order Issued: ${po.poNumber}`,
      html
    });
  } catch (error) {
    throw new ApiError(500, `Email sending failed: ${error.message}`);
  }
};

/**
 * 6. sendInvoiceEmail
 */
const sendInvoiceEmail = async (vendor, invoice, pdfBuffer) => {
  try {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: invoice.currency || 'INR'
    }).format(invoice.totalAmount);

    const formattedDueDate = invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString('en-IN')
      : 'N/A';

    const html = getHtmlTemplate(
      `Invoice ${invoice.invoiceNumber} from QuoteFlow`,
      `Invoice ${invoice.invoiceNumber} is ready`,
      `
        <h2>Hello ${vendor.companyName},</h2>
        <p>This is to confirm that an invoice has been generated for your transaction in the QuoteFlow system:</p>

        <div class="info-card">
          <table>
            <tr>
              <td class="label">Invoice Number</td>
              <td class="value"><strong>${invoice.invoiceNumber}</strong></td>
            </tr>
            <tr>
              <td class="label">Total Amount</td>
              <td class="value"><strong>${formattedAmount}</strong></td>
            </tr>
            <tr>
              <td class="label">Due Date</td>
              <td class="value" style="color: #dc2626; font-weight: 600;">${formattedDueDate}</td>
            </tr>
          </table>
        </div>

        <p>A copy of the invoice is attached to this email as a PDF. You can also view or pay this invoice inside your portal.</p>
      `
    );

    await transporter.sendMail({
      from: EMAIL_FROM,
      to: vendor.email,
      subject: `Invoice ${invoice.invoiceNumber} from QuoteFlow`,
      html,
      attachments: [
        {
          filename: `${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });
  } catch (error) {
    throw new ApiError(500, `Email sending failed: ${error.message}`);
  }
};

module.exports = {
  sendPasswordReset,
  sendVendorInvitation,
  sendApprovalNotification,
  sendApprovalResult,
  sendPOToVendor,
  sendInvoiceEmail
};
