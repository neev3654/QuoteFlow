import { useQuery } from '@tanstack/react-query';
import * as activityApi from '../api/activity.api';

export const useAllLogs = (params) => {
  return useQuery({
    queryKey: ['activity-logs', params],
    queryFn: () => activityApi.getAllLogs(params),
  });
};

export const useMyLogs = (params) => {
  return useQuery({
    queryKey: ['activity-logs', 'my', params],
    queryFn: () => activityApi.getMyLogs(params),
  });
};

export const useLogsByModule = (module, params) => {
  return useQuery({
    queryKey: ['activity-logs', 'module', module, params],
    queryFn: () => activityApi.getLogsByModule(module, params),
    enabled: !!module,
  });
};
