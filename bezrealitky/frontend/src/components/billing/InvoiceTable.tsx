'use client';

import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/lib/graphql-client';
import { formatDate, formatPrice } from '@/lib/utils';
import { FileText } from 'lucide-react';
import { gql } from 'graphql-request';

const MY_INVOICES = gql`
  query MyInvoices {
    myInvoices { id amount currency status pdfUrl createdAt }
  }
`;

export function InvoiceTable() {
  const { data } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => getClient().request(MY_INVOICES),
  });

  const invoices = (data as any)?.myInvoices ?? [];

  if (!invoices.length) {
    return <p className="text-sm text-gray-400">Zatím žádné faktury.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase">
            <th className="pb-2">Datum</th>
            <th className="pb-2">Částka</th>
            <th className="pb-2">Stav</th>
            <th className="pb-2">PDF</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv: any) => (
            <tr key={inv.id} className="border-b last:border-0">
              <td className="py-2">{formatDate(inv.createdAt)}</td>
              <td className="py-2 font-medium">{formatPrice(inv.amount / 100, inv.currency)}</td>
              <td className="py-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {inv.status === 'paid' ? 'Zaplaceno' : inv.status}
                </span>
              </td>
              <td className="py-2">
                {inv.pdfUrl && (
                  <a href={inv.pdfUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-primary-600 hover:underline">
                    <FileText size={14} /> PDF
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
