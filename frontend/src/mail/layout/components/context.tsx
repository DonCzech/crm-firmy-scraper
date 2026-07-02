import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TooltipProvider } from '@/components/ui/tooltip';

const DEFAULT_CSS_VARIABLES = {
  '--sidebar-width': '240px',
  '--sidebar-width-collapse': '60px',
  '--sidebar-width-mobile': '240px',
  '--header-height-mobile': '60px',
  '--aside-width': '80px',
  '--aside-width-mobile': '60px',
  '--page-space': '10px',
  '--mail-list-width': '300px',
} as const;

// Define the shape of the layout state
interface LayoutState {
  style: React.CSSProperties;
  bodyClassName: string;
  isMobile: boolean;
  sidebarCollapsed: boolean;
  isMailViewExpanded: boolean;
  showMailView: () => void;
  hideMailView: () => void;
  toggleMailView: () => void;
  toggleSidebar: () => void;
}

// Create the context
const LayoutContext = createContext<LayoutState | undefined>(undefined);

// Provider component
interface LayoutProviderProps {
  sidebarCollapsed?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
  bodyClassName?: string;
}

export function LayoutProvider({ children, style: customStyle, bodyClassName = '', sidebarCollapsed = false}: LayoutProviderProps) {
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(sidebarCollapsed);
  const [isMailViewExpanded, setIsMailViewExpanded] = useState(false);

  const cssVariables = useMemo(() => ({
    ...DEFAULT_CSS_VARIABLES,
    ...customStyle,
  }), [customStyle]);

  const style: React.CSSProperties = cssVariables;

  // Sidebar toggle function
  const toggleSidebar = () => setIsSidebarCollapsed((open) => !open);
  
  // Aside expanded toggle function
  const toggleMailView = () => setIsMailViewExpanded((open) => !open);

  const showMailView = () => setIsMailViewExpanded(true);
  const hideMailView = () => setIsMailViewExpanded(false);

  return (
    <LayoutContext.Provider
      value={{
        bodyClassName,
        style,
        isMobile,
        sidebarCollapsed: isSidebarCollapsed,
        isMailViewExpanded,
        showMailView,
        hideMailView,
        toggleSidebar,
        toggleMailView,
      }}
    >
      <div
        data-slot="layout-wrapper"
        data-sidebar-collapsed={isSidebarCollapsed}
        data-mail-view-expanded={isMailViewExpanded}
        className={`flex grow ${bodyClassName}`.trim()}
        style={style}
      >
        <TooltipProvider delayDuration={0}>
          {children}
        </TooltipProvider>
      </div>
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
