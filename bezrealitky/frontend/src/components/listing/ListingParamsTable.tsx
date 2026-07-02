import { ESTATE_TYPE_LABELS } from '@/lib/utils';

export function ListingParamsTable({ listing }: { listing: any }) {
  const params = [
    { label: 'Typ nemovitosti', value: ESTATE_TYPE_LABELS[listing.estateType] },
    { label: 'Dispozice', value: listing.rooms },
    { label: 'Plocha', value: listing.area ? `${listing.area} m²` : null },
    { label: 'Patro', value: listing.floor != null ? `${listing.floor}. / ${listing.totalFloors ?? '?'}` : null },
    { label: 'Zařízeno', value: listing.furnished != null ? (listing.furnished ? 'Ano' : 'Ne') : null },
    { label: 'Balkón / terasa', value: listing.balcony != null ? (listing.balcony ? 'Ano' : 'Ne') : null },
    { label: 'Sklep', value: listing.cellar != null ? (listing.cellar ? 'Ano' : 'Ne') : null },
    { label: 'Výtah', value: listing.elevator != null ? (listing.elevator ? 'Ano' : 'Ne') : null },
    { label: 'Parkování', value: listing.parking != null ? (listing.parking ? 'Ano' : 'Ne') : null },
    { label: 'Domácí zvířata', value: listing.petFriendly != null ? (listing.petFriendly ? 'Povolena' : 'Nepovolena') : null },
  ].filter((p) => p.value != null);

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {params.map(({ label, value }, i) => (
            <tr key={label} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="px-4 py-2.5 font-medium text-gray-600 w-1/2">{label}</td>
              <td className="px-4 py-2.5 text-gray-900">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
