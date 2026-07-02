export const CRM_CONTACTS_REFRESH_EVENT = 'crm:contacts:refresh';
export const CRM_TASKS_REFRESH_EVENT = 'crm:tasks:refresh';
export const CRM_NOTES_REFRESH_EVENT = 'crm:notes:refresh';
export const CRM_ACTIVITIES_REFRESH_EVENT = 'crm:activities:refresh';
export const CRM_DEALS_REFRESH_EVENT = 'crm:deals:refresh';
export const CRM_COMPANIES_REFRESH_EVENT = 'crm:companies:refresh';

export function dispatchCrmEvent(eventName: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(eventName));
}
