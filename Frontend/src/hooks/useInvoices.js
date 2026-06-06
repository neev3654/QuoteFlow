import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as invoiceApi from '../api/invoice.api';

export const useInvoices = (params) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceApi.getInvoices(params),
  });
};

export const useInvoice = (id) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoiceApi.getInvoiceById(id),
    enabled: !!id,
  });
};

export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ poId, data }) => invoiceApi.generateInvoice(poId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice generated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to generate invoice');
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => invoiceApi.updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
      toast.success('Invoice updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update invoice');
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => invoiceApi.updateInvoiceStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
      toast.success('Invoice status updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update invoice status');
    },
  });
};

export const useSendInvoiceEmail = () => {
  return useMutation({
    mutationFn: invoiceApi.sendInvoiceEmail,
    onSuccess: () => {
      toast.success('Invoice email sent successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to send invoice email');
    },
  });
};

export const useMarkInvoicePaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentMethod }) => invoiceApi.markInvoicePaid(id, paymentMethod),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
      toast.success('Invoice marked as paid successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to mark invoice as paid');
    },
  });
};
