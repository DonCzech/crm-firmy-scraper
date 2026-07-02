'use client';
import { Plus, Upload, ChevronDown, BarChart3, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomerListDisplaySheet, CustomerListTable } from '../tables/customer-list';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchContacts } from '@/crm/services/backend';
import { CRM_CONTACTS_REFRESH_EVENT } from '@/crm/services/events';
import { logFrontendError } from '@/crm/services/frontend-logger';
import { useNavigate } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSearchParams } from 'react-router-dom';
import { Customer360Timeline } from '@/crm/components/customer-360-timeline';


export function CustomerListDetails() {  
  const navigate = useNavigate();
  const latestCountsRequestRef = useRef(0);
  const [searchParams] = useSearchParams();
  const focusCustomerId = searchParams.get('customerId') || undefined;
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [displaySheet, setDisplaySheet] = useState<CustomerListDisplaySheet | undefined>('customerDetails');
  const [shouldOpenSheet, setShouldOpenSheet] = useState(true);

  // Handle displaySheet change
  const handleDisplaySheetChange = (newDisplaySheet: CustomerListDisplaySheet) => {
    setDisplaySheet(newDisplaySheet);
    setShouldOpenSheet(true); // Always set to true when opening
  };

  // Handle sheet close
  const handleSheetClose = () => {
    setShouldOpenSheet(false);
  };

  useEffect(() => {
    let active = true;
    const loadCounts = async () => {
      const requestId = latestCountsRequestRef.current + 1;
      latestCountsRequestRef.current = requestId;
      try {
        const response = await fetchContacts({ limit: 1000, contactType: 'customer' });
        const customers = (response?.data ?? []).filter((item) => item.contactType === 'customer');
        if (!active || requestId !== latestCountsRequestRef.current) return;
        setTotalCustomers(customers.length);
        setActiveCustomers(customers.filter((item) => (item as { status?: string }).status === 'active').length);
      } catch (error) {
        logFrontendError({
          area: 'store-customer-list-details',
          message: error instanceof Error ? error.message : 'Failed to load customer summary',
          meta: { operation: 'load_customer_counts' },
        });
        if (!active || requestId !== latestCountsRequestRef.current) return;
        setTotalCustomers(0);
        setActiveCustomers(0);
      }
    };
    void loadCounts();
    const refresh = () => void loadCounts();
    window.addEventListener(CRM_CONTACTS_REFRESH_EVENT, refresh);
    return () => {
      active = false;
      window.removeEventListener(CRM_CONTACTS_REFRESH_EVENT, refresh);
    };
  }, []);

  const activePct = useMemo(() => {
    if (totalCustomers <= 0) return 0;
    return Math.round((activeCustomers / totalCustomers) * 100);
  }, [activeCustomers, totalCustomers]);

  return (
    <div className="container-fluid space-y-5 lg:space-y-9">
      <div className="flex items-center flex-wrap gap-2 justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Customer List</h1>
          <span className="text-sm text-muted-foreground">
            {totalCustomers.toLocaleString('en-US')} Customers found. {activePct}% are active
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 shrink-0"
            onClick={() => window.dispatchEvent(new Event('customer-list:export-all'))}
          >
            <Upload className="h-4 w-4" />
            Export
          </Button>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[130px] justify-between">
                More Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/core/crm/contacts')}>
                <BarChart3  />
                Customer Tracking
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  navigate(
                    focusCustomerId
                      ? `/core/crm/contacts/${focusCustomerId}`
                      : '/core/crm/contacts',
                  )
                }
              >
                <User  />
                View Customer Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => window.dispatchEvent(new Event('customer-list:delete-selected'))}
              >
                <Trash2  />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="mono" onClick={() => handleDisplaySheetChange("createCustomer")}>
            <Plus/> New
          </Button>
        </div>
      </div>
      
      <CustomerListTable 
        displaySheet={displaySheet} 
        shouldOpenSheet={shouldOpenSheet}
        onSheetClose={handleSheetClose}
        focusCustomerId={focusCustomerId}
      />

      {focusCustomerId ? (
        <Customer360Timeline contactId={focusCustomerId} />
      ) : null}
    </div>
  );
}
