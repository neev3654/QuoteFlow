import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as quotationApi from '../api/quotation.api';

export const useQuotations = (params) => {
  return useQuery({
    queryKey: ['quotations', params],
    queryFn: () => quotationApi.getQuotations(params),
  });
};

export const useMyQuotations = (params) => {
  return useQuery({
    queryKey: ['quotations', 'my', params],
    queryFn: () => quotationApi.getMyQuotations(params),
  });
};

export const useQuotation = (id) => {
  return useQuery({
    queryKey: ['quotations', id],
    queryFn: () => quotationApi.getQuotationById(id),
    enabled: !!id,
  });
};

export const useSubmitQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rfqId, data }) => quotationApi.submitQuotation(rfqId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation submitted successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit quotation');
    },
  });
};

export const useEditQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => quotationApi.editQuotation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotations', variables.id] });
      toast.success('Quotation updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update quotation');
    },
  });
};

export const useFinalizeQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationApi.finalizeQuotation,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotations', id] });
      toast.success('Quotation finalized successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to finalize quotation');
    },
  });
};

export const useAcceptQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationApi.acceptQuotation,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotations', id] });
      toast.success('Quotation accepted successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to accept quotation');
    },
  });
};

export const useRejectQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => quotationApi.rejectQuotation(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotations', variables.id] });
      toast.success('Quotation rejected successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to reject quotation');
    },
  });
};

export const useCompareQuotations = (rfqId, sortBy) => {
  return useQuery({
    queryKey: ['quotations', 'compare', rfqId, sortBy],
    queryFn: () => quotationApi.compareQuotations(rfqId, sortBy),
    enabled: !!rfqId,
  });
};
