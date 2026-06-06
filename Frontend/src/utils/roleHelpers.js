import { ROLES } from './constants';

export const isAdmin = (user) => user?.role === ROLES.ADMIN;
export const isManager = (user) => user?.role === ROLES.MANAGER;
export const isProcurementOfficer = (user) => user?.role === ROLES.PROCUREMENT_OFFICER;
export const isVendor = (user) => user?.role === ROLES.VENDOR;

export const canCreateRFQ = (user) => 
  isAdmin(user) || isProcurementOfficer(user);

export const canApprove = (user) => 
  isAdmin(user) || isManager(user);

export const canManageVendors = (user) => 
  isAdmin(user) || isManager(user) || isProcurementOfficer(user);
