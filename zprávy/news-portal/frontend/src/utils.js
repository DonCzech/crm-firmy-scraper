export function formatTimeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 2)   return 'právě teď';
  if (mins < 60)  return `před ${mins} min`;
  if (hours < 24) return `před ${hours} h`;
  if (days < 7)   return `před ${days} dny`;
  return new Date(iso).toLocaleDateString('cs-CZ',
    { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('cs-CZ',
    { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
