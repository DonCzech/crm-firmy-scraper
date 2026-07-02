import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Package, Search, ShoppingCart, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { fetchContacts, fetchOrders, fetchProducts, type BackendContact, type BackendOrder, type BackendProduct } from '@/crm/services/backend';
import { useIsMobile } from '@/hooks/use-mobile';

type SearchResult =
  | { kind: 'product'; id: string; title: string; subtitle: string; to: string }
  | { kind: 'order'; id: string; title: string; subtitle: string; to: string }
  | { kind: 'contact'; id: string; title: string; subtitle: string; to: string };

export function SearchBar() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const searchShopLabel = 'Hledat...';
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const desktopContainerRef = useRef<HTMLDivElement | null>(null);

  const mapProducts = useCallback(
    (rows: BackendProduct[]): SearchResult[] =>
      rows.map((item) => ({
        kind: 'product',
        id: item.id,
        title: item.name || 'Produkt',
        subtitle: `${item.sku || 'bez SKU'} • ${item.category || 'kategorie neuvedena'}`,
        to: `/core/product-list?productId=${encodeURIComponent(item.id)}`,
      })),
    [],
  );

  const mapOrders = useCallback(
    (rows: BackendOrder[]): SearchResult[] =>
      rows.map((item) => ({
        kind: 'order',
        id: item.id,
        title: item.orderNumber || 'Objednávka',
        subtitle: `${item.customerName || 'zákazník'} • ${item.total.toFixed(2)} ${item.currency}`,
        to: `/core/order-details?orderId=${encodeURIComponent(item.id)}`,
      })),
    [],
  );

  const mapContacts = useCallback(
    (rows: BackendContact[]): SearchResult[] =>
      rows.map((item) => {
        const name = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Kontakt';
        const contactType = (item.contactType || '').toLowerCase();
        const isCustomer = (item.contactType || '').toLowerCase() === 'customer';
        const isLead = contactType === 'lead';
        return {
          kind: 'contact' as const,
          id: item.id,
          title: name,
          subtitle: `${item.email || item.phone || 'bez kontaktu'} • ${item.contactType || 'contact'}`,
          to: isCustomer
            ? `/core/customer-list-details?customerId=${encodeURIComponent(item.id)}`
            : isLead
              ? `/core/crm/leads/${encodeURIComponent(item.id)}`
              : `/core/crm/contacts/${encodeURIComponent(item.id)}`,
        };
      }),
    [],
  );

  const runSearch = useCallback(async (term: string) => {
    const q = term.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [productsResponse, ordersResponse, contactsResponse] = await Promise.all([
        fetchProducts({ page: 1, limit: 7, search: q }),
        fetchOrders({ page: 1, limit: 7, search: q }),
        fetchContacts({ limit: 7, search: q }),
      ]);

      const merged = [
        ...mapProducts(productsResponse.data || []),
        ...mapOrders(ordersResponse.data || []),
        ...mapContacts(contactsResponse.data || []),
      ].slice(0, 20);

      setResults(merged);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [mapContacts, mapOrders, mapProducts]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runSearch(query);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, runSearch]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (!isCmdK) return;
      event.preventDefault();
      setIsOpen(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!desktopContainerRef.current || !target) return;
      if (!desktopContainerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, []);

  const onSelect = (to: string) => {
    setIsOpen(false);
    navigate(to);
  };

  const onSubmit = () => {
    if (results.length > 0) {
      onSelect(results[0].to);
      return;
    }
    toast.error('Žádné výsledky pro zadaný dotaz');
  };

  const resultIcon = (kind: SearchResult['kind']) => {
    if (kind === 'product') return <Package className="size-4 text-muted-foreground shrink-0" />;
    if (kind === 'order') return <ShoppingCart className="size-4 text-muted-foreground shrink-0" />;
    return <UserRound className="size-4 text-muted-foreground shrink-0" />;
  };

  const ResultList = (
    <div className="space-y-2">
      {loading && (
        <div className="py-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Hledám...
        </div>
      )}

      {!loading && query.trim().length === 0 && (
        <div className="py-3 text-xs text-muted-foreground">Začněte psát pro hledání…</div>
      )}

      {!loading && query.trim().length > 0 && results.length === 0 && (
        <div className="py-3 text-xs text-muted-foreground">Žádné výsledky</div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-1">
          {results.map((item) => (
            <button
              key={`${item.kind}-${item.id}`}
              type="button"
              onClick={() => onSelect(item.to)}
              className="w-full text-left rounded-md px-2.5 py-2 hover:bg-accent"
            >
              <div className="flex items-start gap-2">
                {resultIcon(item.kind)}
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.subtitle}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" shape="circle" className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary">
            <Search className="size-4.5!" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="center">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 start-2" />
            <Input
              type="text"
              className="px-7 pe-16"
              placeholder={searchShopLabel}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSubmit();
              }}
            />
            <Badge
              className="absolute top-1/2 -translate-y-1/2 end-2 gap-1"
              variant="outline"
              size="sm"
            >
              ⌘ K
            </Badge>
          </div>
          <div className="mt-3 max-h-72 overflow-y-auto">{ResultList}</div>
        </PopoverContent>
      </Popover>
    );
  }
  
  return (
    <div ref={desktopContainerRef} className="relative lg:w-[300px]">
      <Search className="size-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 start-2" />
      <Input
        type="text"
        className="px-7 pe-16"
        placeholder={searchShopLabel}
        value={query}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit();
          if (event.key === 'Escape') setIsOpen(false);
        }}
      />
      <Badge
        className="absolute top-1/2 -translate-y-1/2 end-2 gap-1"
        variant="outline"
        size="sm"
      >
        ⌘ K
      </Badge>
      {isOpen && (
        <div className="absolute z-50 mt-2 w-[420px] end-0 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md shadow-black/5">
          {ResultList}
        </div>
      )}
    </div>
  );
}
