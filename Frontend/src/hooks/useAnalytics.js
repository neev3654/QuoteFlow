import { useQuery } from '@tanstack/react-query';
import * as analyticsApi from '../api/analytics.api';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsApi.getDashboardSummary(),
  });
};

export const useMonthlySpending = (params) => {
  return useQuery({
    queryKey: ['analytics', 'spending', params],
    queryFn: () => analyticsApi.getMonthlySpending(params),
  });
};

export const useVendorPerformance = (params) => {
  return useQuery({
    queryKey: ['analytics', 'vendors', params],
    queryFn: () => analyticsApi.getVendorPerformance(params),
  });
};

export const useProcurementStats = (params) => {
  return useQuery({
    queryKey: ['analytics', 'procurement', params],
    queryFn: () => analyticsApi.getProcurementStats(params),
  });
};

export const useRFQStatusDistribution = () => {
  return useQuery({
    queryKey: ['analytics', 'rfq-status'],
    queryFn: () => analyticsApi.getRFQStatusDistribution(),
  });
};

export const useTopVendors = () => {
  return useQuery({
    queryKey: ['analytics', 'top-vendors'],
    queryFn: () => analyticsApi.getTopVendors(),
  });
};
