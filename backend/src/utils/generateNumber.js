/**
 * Generate a zero-padded 4-digit random number
 */
const randomSuffix = () => {
  return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
};

/**
 * Get current date in YYYYMMDD format
 */
const datePart = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Generate RFQ number: RFQ-YYYYMMDD-XXXX
 */
const generateRFQNumber = () => {
  return `RFQ-${datePart()}-${randomSuffix()}`;
};

/**
 * Generate PO number: PO-YYYYMMDD-XXXX
 */
const generatePONumber = () => {
  return `PO-${datePart()}-${randomSuffix()}`;
};

/**
 * Generate Invoice number: INV-YYYYMMDD-XXXX
 */
const generateInvoiceNumber = () => {
  return `INV-${datePart()}-${randomSuffix()}`;
};

/**
 * Generate Vendor code: VND-XXXX
 */
const generateVendorCode = () => {
  return `VND-${randomSuffix()}`;
};

module.exports = {
  generateRFQNumber,
  generatePONumber,
  generateInvoiceNumber,
  generateVendorCode
};
