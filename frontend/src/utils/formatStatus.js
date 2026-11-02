import {
  AVAILABILITY_STATUSES,
  VERIFICATION_STATUSES,
  BORROW_STATUSES,
  RETURN_STATUSES,
} from './constants';

export const getAvailabilityBadge = (status) => {
  return AVAILABILITY_STATUSES[status] || {
    label: status || 'Unknown',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  };
};

export const getVerificationBadge = (status) => {
  return VERIFICATION_STATUSES[status] || {
    label: status || 'Unknown',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  };
};

export const getBorrowBadge = (status) => {
  return BORROW_STATUSES[status] || {
    label: status || 'Unknown',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  };
};

export const getReturnBadge = (status) => {
  return RETURN_STATUSES[status] || {
    label: status || 'Unknown',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  };
};

export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-equipment.svg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  return `${serverUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};
