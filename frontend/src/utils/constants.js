export const EQUIPMENT_CATEGORIES = [
  'Wheelchair',
  'Walker',
  'Crutches',
  'Hospital Bed',
  'Oxygen Equipment',
  'Commode Chair',
  'Patient Lift',
  'Nebulizer',
  'Blood Pressure Monitor',
  'Other',
];

export const EQUIPMENT_CONDITIONS = [
  { value: 'NEW', label: 'New / Unused' },
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
];

export const AVAILABILITY_STATUSES = {
  AVAILABLE: { label: 'Available', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  BORROWED: { label: 'Currently Borrowed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  RESERVED: { label: 'Reserved', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  MAINTENANCE: { label: 'In Maintenance', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  SANITIZATION: { label: 'In Sanitization', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  UNAVAILABLE: { label: 'Unavailable', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const VERIFICATION_STATUSES = {
  PENDING: { label: 'Pending Verification', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Declined', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const BORROW_STATUSES = {
  PENDING: { label: 'Pending Approval', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED: { label: 'Approved / Ready', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ACTIVE: { label: 'Active Borrowing', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  RETURN_REQUESTED: { label: 'Return Initiated', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  COMPLETED: { label: 'Completed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export const RETURN_STATUSES = {
  REQUESTED: { label: 'Handover Requested', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  RECEIVED: { label: 'Received by Owner', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  INSPECTION_PENDING: { label: 'Inspection Pending', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};
