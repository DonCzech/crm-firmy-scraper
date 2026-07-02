import {
  createCustomField,
  fetchCustomFields,
  getCustomFieldValue,
  setCustomFieldValue,
} from './backend';

type LeadMetaKey =
  | 'lead_priority'
  | 'lead_category'
  | 'lead_note'
  | 'lead_website'
  | 'lead_phone_type'
  | 'lead_territory'
  | 'lead_is_company'
  | 'lead_owner'
  | 'lead_ico'
  | 'lead_dic'
  | 'lead_contact_person'
  | 'lead_databox'
  | 'lead_phone2'
  | 'lead_email2'
  | 'lead_gps'
  | 'lead_is_person';

export type LeadMetaValues = {
  lead_priority?: string;
  lead_category?: string;
  lead_note?: string;
  lead_website?: string;
  lead_phone_type?: string;
  lead_territory?: string;
  lead_is_company?: string;
  lead_owner?: string;
  lead_ico?: string;
  lead_dic?: string;
  lead_contact_person?: string;
  lead_databox?: string;
  lead_phone2?: string;
  lead_email2?: string;
  lead_gps?: string;
  lead_is_person?: string;
};

type LeadMetaField = {
  key: LeadMetaKey;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'url' | 'boolean';
  options?: string[];
};

const FIELD_DEFINITIONS: LeadMetaField[] = [
  {
    key: 'lead_priority',
    label: 'Lead Priorita',
    type: 'select',
    options: ['low', 'normal', 'high'],
  },
  {
    key: 'lead_category',
    label: 'Lead Kategorie',
    type: 'select',
    options: ['real_estate', 'insurance', 'financial'],
  },
  {
    key: 'lead_note',
    label: 'Poznámka k leadu',
    type: 'textarea',
  },
  {
    key: 'lead_website',
    label: 'Lead Web',
    type: 'url',
  },
  {
    key: 'lead_phone_type',
    label: 'Lead Typ Telefonu',
    type: 'select',
    options: ['mobile', 'work', 'home'],
  },
  {
    key: 'lead_territory',
    label: 'Lead Obchodní Teritorium',
    type: 'text',
  },
  {
    key: 'lead_is_company',
    label: 'Lead Firma',
    type: 'boolean',
  },
  {
    key: 'lead_owner',
    label: 'Lead Vlastnik',
    type: 'text',
  },
  {
    key: 'lead_ico',
    label: 'Lead ICO',
    type: 'text',
  },
  {
    key: 'lead_dic',
    label: 'Lead DIC',
    type: 'text',
  },
  {
    key: 'lead_contact_person',
    label: 'Lead Kontaktni osoba',
    type: 'text',
  },
  {
    key: 'lead_databox',
    label: 'Lead Datova schranka',
    type: 'text',
  },
  {
    key: 'lead_phone2',
    label: 'Lead Tel 2',
    type: 'text',
  },
  {
    key: 'lead_email2',
    label: 'Lead Email 2',
    type: 'email',
  },
  {
    key: 'lead_gps',
    label: 'Lead GPS',
    type: 'text',
  },
  {
    key: 'lead_is_person',
    label: 'Lead Fyzicka osoba',
    type: 'boolean',
  },
];

let fieldCache: Partial<Record<LeadMetaKey, string>> | null = null;

async function ensureFieldIdMap(): Promise<Record<LeadMetaKey, string>> {
  if (fieldCache && Object.keys(fieldCache).length === FIELD_DEFINITIONS.length) {
    return fieldCache as Record<LeadMetaKey, string>;
  }

  const existing = await fetchCustomFields({
    entityType: 'contact',
    limit: 500,
  });
  const byName = new Map((existing?.data ?? []).map((field) => [field.fieldName, field]));
  const result: Partial<Record<LeadMetaKey, string>> = {};

  for (const definition of FIELD_DEFINITIONS) {
    const current = byName.get(definition.key);
    if (current?.id) {
      result[definition.key] = current.id;
      continue;
    }

    try {
      const created = await createCustomField({
        entityType: 'contact',
        fieldName: definition.key,
        fieldType: definition.type,
        fieldLabel: definition.label,
        options: definition.options ? JSON.stringify(definition.options) : undefined,
      });
      result[definition.key] = created.id;
    } catch {
      const refresh = await fetchCustomFields({
        entityType: 'contact',
        limit: 500,
      });
      const createdAfterRace = (refresh?.data ?? []).find(
        (item) => item.fieldName === definition.key,
      );
      if (createdAfterRace?.id) {
        result[definition.key] = createdAfterRace.id;
      }
    }
  }

  fieldCache = result;
  return result as Record<LeadMetaKey, string>;
}

export async function saveLeadMeta(contactId: string, values: LeadMetaValues) {
  const fieldMap = await ensureFieldIdMap();
  const entries = Object.entries(values) as Array<[LeadMetaKey, string | undefined]>;

  await Promise.all(
    entries
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) =>
        setCustomFieldValue({
          fieldId: fieldMap[key],
          contactId,
          value: value ?? '',
        }),
      ),
  );
}

export async function loadLeadMeta(contactId: string): Promise<LeadMetaValues> {
  const fieldMap = await ensureFieldIdMap();

  const entries = await Promise.all(
    FIELD_DEFINITIONS.map(async (definition) => {
      const fieldId = fieldMap[definition.key];
      if (!fieldId) return [definition.key, undefined] as const;

      const value = await getCustomFieldValue({
        fieldId,
        contactId,
      });

      return [definition.key, value?.value] as const;
    }),
  );

  return Object.fromEntries(entries);
}
