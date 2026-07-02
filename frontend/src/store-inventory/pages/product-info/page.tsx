'use client';
import { useEffect, useState } from 'react';
import {
  fetchProducts,
  type BackendProduct,
} from '@/crm/services/backend';
import { ProductInfoSheet } from '../components/product-info-sheet'; 
import type { IData } from '../components/product-info-sheet';

function formatCurrency(value: number, currency = 'CZK'): string {
  try {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

function mapProductsToRows(products: BackendProduct[]): IData[] {
  return (products || []).map((product) => ({
    id: product.id,
    productInfo: {
      image: product.image || '11.png',
      title: product.name || 'Unnamed product',
      label: product.sku || '-',
      tooltip: product.description || product.name || '',
    },
    category: product.category || 'General',
    price: formatCurrency(Number(product.price || 0), 'CZK'),
    trends: {
      label: product.status === 'published' ? 'Active' : 'Draft',
      variant: product.status === 'published' ? 'success' : 'secondary',
    },
    stock: 0,
    rsvd: 0,
    tlvl: 0,
    supplier: {
      name: product.brand || 'Default supplier',
      logo: 'clusterhq.svg',
    },
  }));
}

export function ProductInfoPage() {
  const [rows, setRows] = useState<IData[]>([]);

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      try {
        const response = await fetchProducts({ page: 1, limit: 500 });
        if (!active) return;
        setRows(mapProductsToRows(response.data || []));
      } catch {
        if (!active) return;
        setRows([]);
      }
    };
    void loadProducts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container-fluid"> 
      <ProductInfoSheet mockData={rows} />
    </div>
  );
}
