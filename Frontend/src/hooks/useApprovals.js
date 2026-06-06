import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as approvalApi from '../api/approval.api';

export const useApprovals = (params) => {
  return useQuery({
    queryKey: ['approvals', params],
    queryFn: () => approvalApi.getApprovals(params),
  });
};

export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: () => approvalApi.getPendingApprovals(),
  });
};

export const useApproval = (id) => {
  return useQuery({
    queryKey: ['approvals', id],
    queryFn: () => approvalApi.getApprovalById(id),
    enabled: !!id,
  });
};

export const useInitiateApproval = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quotationId, approverId }) => approvalApi.initiateApproval(quotationId, approverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast.success('Approval initiated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to initiate approval');
    },
  });
};

export const useApproveApproval = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }) => approvalApi.approveApproval(id, remarks),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approvals', variables.id] });
      toast.success('Request approved successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to approve request');
    },
  });
};

export const useRejectApproval = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }) => approvalApi.rejectApproval(id, remarks),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approvals', variables.id] });
      toast.success('Request rejected successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to reject request');
    },
  });
};

export const useQuotationApproval = (quotationId) => {
  return useQuery({
    queryKey: ['approvals', 'quotation', quotationId],
    queryFn: () => approvalApi.getQuotationApproval(quotationId),
    enabled: !!quotationId,
  });
};
