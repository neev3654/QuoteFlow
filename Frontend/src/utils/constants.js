export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  PROCUREMENT_OFFICER: 'procurement_officer',
  VENDOR: 'vendor',
};

export const STATUS_COLORS = {
  // RFQ Statuses
  draft: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  published: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  closed: 'bg-violet-500/15 text-violet-400 border-violet-500/20',

  // Quotation Statuses
  submitted: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  under_review: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  accepted: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/20',

  // PO Statuses
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  sent: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  acknowledged: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  delivered: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',

  // Invoice Statuses
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  overdue: 'bg-red-500/15 text-red-400 border-red-500/20',
  
  // Vendor Statuses
  active: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  blacklisted: 'bg-red-500/15 text-red-400 border-red-500/20',
};

export const VENDOR_CATEGORIES = [
  'IT_Equipment',
  'Office_Supplies',
  'Furniture',
  'Software',
  'Services',
  'Hardware',
  'Other',
];

export const RFQ_STATUSES = ['draft', 'published', 'closed'];
export const QUOTATION_STATUSES = ['submitted', 'under_review', 'accepted', 'rejected'];
export const PO_STATUSES = ['pending', 'sent', 'acknowledged', 'delivered', 'cancelled'];
export const INVOICE_STATUSES = ['pending', 'paid', 'overdue', 'cancelled'];
