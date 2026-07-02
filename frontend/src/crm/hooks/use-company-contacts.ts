import { useEffect, useMemo, useState } from 'react';
import { fetchContacts } from '@/crm/services/backend';

type CompanyContact = {
  id: string;
  name: string;
  avatar?: string;
};

const CACHE_TTL_MS = 60_000;
let contactsCache: CompanyContact[] | null = null;
let contactsCacheAt = 0;
let contactsInFlight: Promise<CompanyContact[]> | null = null;

async function loadContactsCached(): Promise<CompanyContact[]> {
  const now = Date.now();
  if (contactsCache && now - contactsCacheAt < CACHE_TTL_MS) {
    return contactsCache;
  }
  if (contactsInFlight) return contactsInFlight;

  contactsInFlight = (async () => {
    const response = await fetchContacts({ limit: 500 });
    const mapped = (response?.data ?? []).map((contact) => ({
      id: contact.id,
      name:
        `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() ||
        contact.email ||
        'Kontakt',
      avatar: contact.avatar || undefined,
    }));
    contactsCache = mapped;
    contactsCacheAt = Date.now();
    return mapped;
  })();

  try {
    return await contactsInFlight;
  } finally {
    contactsInFlight = null;
  }
}

export function useCompanyContacts() {
  const [contacts, setContacts] = useState<CompanyContact[]>(() => contactsCache ?? []);
  const [loading, setLoading] = useState(!contactsCache);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const items = await loadContactsCached();
        if (isMounted) setContacts(items);
      } catch {
        if (isMounted) setContacts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const contactsById = useMemo(() => {
    const map = new Map<string, CompanyContact>();
    for (const contact of contacts) {
      map.set(contact.id, contact);
    }
    return map;
  }, [contacts]);

  return { contacts, contactsById, loading };
}

