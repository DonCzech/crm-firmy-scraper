import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { NavConfig } from '@/crm/config/types';

// Define the shape of the layout state
interface LayoutState {
  sidebarCollapse: boolean;
  setSidebarCollapse: (open: boolean) => void;
  embedded: boolean;
  sidebarPinnedNavItems: string[];
  pinSidebarNavItem: (id: string) => void;
  unpinSidebarNavItem: (id: string) => void;
  isSidebarNavItemPinned: (id: string) => boolean;
  getSidebarNavItems: () => NavConfig;
}

// Create the context
const LayoutContext = createContext<LayoutState | undefined>(undefined);

// Provider component
interface LayoutProviderProps {
  children: ReactNode;
  sidebarNavItems: NavConfig;
  embedded?: boolean;
}

export function LayoutProvider({
  children,
  sidebarNavItems,
  embedded = false,
}: LayoutProviderProps) {
  const [sidebarCollapse, setSidebarCollapse] = useState(false);
  const initialPinned = sidebarNavItems
    .filter((item) => item.pinned)
    .map((item) => item.id);
  const [sidebarPinnedNavItems, setSidebarPinnedNavItems] =
    useState<string[]>(initialPinned);

  // Sync any newly-added config-pinned items into state (handles HMR + runtime config changes)
  useEffect(() => {
    const configPinned = sidebarNavItems
      .filter((item) => item.pinned)
      .map((item) => item.id);
    setSidebarPinnedNavItems((prev) => {
      const toAdd = configPinned.filter((id) => !prev.includes(id));
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
  }, [sidebarNavItems]);

  const pinSidebarNavItem = (id: string) => {
    setSidebarPinnedNavItems((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  };
  const unpinSidebarNavItem = (id: string) => {
    setSidebarPinnedNavItems((prev) => prev.filter((itemId) => itemId !== id));
  };
  const isSidebarNavItemPinned = (id: string) => {
    return sidebarPinnedNavItems.includes(id);
  };

  // Memoize the processed navigation items to prevent duplicate object creation
  const processedNavItems = useMemo(() => {
    return sidebarNavItems.map((item) => {
      if (item.pinnable) {
        return {
          ...item,
          pinned: sidebarPinnedNavItems.includes(item.id),
        };
      }
      return item;
    });
  }, [sidebarNavItems, sidebarPinnedNavItems]);

  const getSidebarNavItems = () => {
    return processedNavItems;
  };

  return (
    <LayoutContext.Provider
      value={{
        sidebarCollapse,
        setSidebarCollapse,
        embedded,
        sidebarPinnedNavItems,
        getSidebarNavItems,
        pinSidebarNavItem,
        unpinSidebarNavItem,
        isSidebarNavItemPinned,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

// Custom hook for consuming the context
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
