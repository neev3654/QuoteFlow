# QuoteFlow — Procurement & Vendor Management ERP Backend

A complete backend for a Procurement and Vendor Management ERP system, designed to manage the full lifecycle of purchase requests, vendor approvals, quotations, and invoicing.

## Tech Stack
- **Node.js** (v18+)
- **Express.js**
- **MongoDB** & **Mongoose**
- **JWT** (JSON Web Tokens) for Authentication
- **Puppeteer** for PDF Generation
- **Nodemailer** for Email Notifications
- **Winston** for Logging

## Prerequisites
- Node.js v18 or higher
- MongoDB (Local or Atlas)
- An SMTP server or Gmail account for Nodemailer

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in the missing values (e.g., `MONGODB_URI`, `JWT_SECRET`, `EMAIL_USER`, etc.)
4. **Seed the database** (creates default admin/manager/officer users):
   ```bash
   npm run seed
   ```
5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Default Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@quoteflow.com | Admin@12345 |
| Manager | manager@quoteflow.com | Manager@12345 |
| Procurement Officer | officer@quoteflow.com | Officer@12345 |

## Basic Workflow
1. **RFQ (Request for Quotation)**: Procurement Officer creates an RFQ and sends it to Vendors.
2. **Quotation**: Vendors submit Quotations for the RFQ.
3. **Approval**: Procurement Officer compares quotes and requests Approval. Manager approves/rejects.
4. **Purchase Order (PO)**: Once approved, a PO is automatically generated and sent to the Vendor.
5. **Invoice**: Vendor generates an Invoice against the PO for payment processing.

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `NODE_ENV` | Environment (development/production) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for access token |
| `JWT_EXPIRES_IN` | Expiration for access token (e.g. 15m) |
| `REFRESH_TOKEN_SECRET` | Secret key for refresh token |
| `REFRESH_TOKEN_EXPIRES_IN` | Expiration for refresh token (e.g. 7d) |
| `CLIENT_URL` | Frontend URL for CORS |
| `EMAIL_HOST` | SMTP Host |
| `EMAIL_PORT` | SMTP Port (e.g. 587) |
| `EMAIL_USER` | SMTP Username |
| `EMAIL_PASS` | SMTP Password |
| `EMAIL_FROM` | Default From Email Address |

## API Route Reference

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| **Auth** | | | | |
| POST | `/api/v1/auth/register` | No | - | Register a new user |
| POST | `/api/v1/auth/login` | No | - | Login and get tokens |
| POST | `/api/v1/auth/logout` | Yes | - | Logout user |
| POST | `/api/v1/auth/refresh-token` | No | - | Get new access token using refresh token |
| GET | `/api/v1/auth/me` | Yes | - | Get current user profile |
| POST | `/api/v1/auth/forgot-password` | No | - | Request password reset email |
| PUT | `/api/v1/auth/reset-password/:token` | No | - | Reset password |
| **Users** | | | | |
| GET | `/api/v1/users` | Yes | Admin | Get all users |
| GET | `/api/v1/users/:id` | Yes | Admin | Get user by ID |
| PUT | `/api/v1/users/:id` | Yes | Admin | Update user details |
| DELETE | `/api/v1/users/:id` | Yes | Admin | Deactivate user |
| **Vendors** | | | | |
| POST | `/api/v1/vendors` | Yes | Officer, Admin | Create a new vendor profile |
| GET | `/api/v1/vendors` | Yes | Officer, Manager, Admin | Get all vendors |
| GET | `/api/v1/vendors/:id` | Yes | All | Get vendor by ID |
| PUT | `/api/v1/vendors/:id` | Yes | Officer, Admin, Vendor | Update vendor profile |
| PUT | `/api/v1/vendors/:id/status` | Yes | Admin, Manager | Update vendor status (approve/reject) |
| **RFQs** | | | | |
| POST | `/api/v1/rfqs` | Yes | Officer, Admin | Create RFQ |
| GET | `/api/v1/rfqs` | Yes | All | Get all RFQs |
| GET | `/api/v1/rfqs/:id` | Yes | All | Get RFQ by ID |
| PUT | `/api/v1/rfqs/:id` | Yes | Officer, Admin | Update RFQ |
| PUT | `/api/v1/rfqs/:id/status` | Yes | Officer, Admin | Update RFQ status (e.g. published) |
| **Quotations** | | | | |
| POST | `/api/v1/quotations` | Yes | Vendor | Submit a quotation |
| GET | `/api/v1/quotations` | Yes | Officer, Manager, Admin | Get all quotations |
| GET | `/api/v1/quotations/vendor` | Yes | Vendor | Get vendor's own quotations |
| GET | `/api/v1/quotations/rfq/:rfqId` | Yes | Officer, Manager, Admin | Get quotations for specific RFQ |
| GET | `/api/v1/quotations/compare/:rfqId` | Yes | Officer, Manager, Admin | Compare quotations for RFQ |
| GET | `/api/v1/quotations/:id` | Yes | All | Get quotation by ID |
| **Approvals** | | | | |
| POST | `/api/v1/approvals` | Yes | Officer, Admin | Request approval for a quotation |
| GET | `/api/v1/approvals` | Yes | Officer, Manager, Admin | Get approvals |
| GET | `/api/v1/approvals/:id` | Yes | Officer, Manager, Admin | Get approval by ID |
| PUT | `/api/v1/approvals/:id/review` | Yes | Manager, Admin | Approve or reject a request |
| **Purchase Orders** | | | | |
| POST | `/api/v1/purchase-orders` | Yes | Officer, Admin | Generate PO from quotation |
| GET | `/api/v1/purchase-orders` | Yes | All | Get all POs |
| GET | `/api/v1/purchase-orders/:id` | Yes | All | Get PO by ID |
| PUT | `/api/v1/purchase-orders/:id/status` | Yes | Officer, Vendor, Admin | Update PO status |
| GET | `/api/v1/purchase-orders/:id/pdf` | Yes | All | Generate and download PO PDF |
| **Invoices** | | | | |
| POST | `/api/v1/invoices` | Yes | Vendor | Submit invoice against PO |
| GET | `/api/v1/invoices` | Yes | All | Get all invoices |
| GET | `/api/v1/invoices/:id` | Yes | All | Get invoice by ID |
| PUT | `/api/v1/invoices/:id/status` | Yes | Officer, Manager, Admin | Update invoice status |
| **Activity Logs** | | | | |
| GET | `/api/v1/activity` | Yes | Manager, Admin | Get system activity logs |
| **Analytics** | | | | |
| GET | `/api/v1/analytics/dashboard` | Yes | Manager, Admin | Get dashboard statistics |
