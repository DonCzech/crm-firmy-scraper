import { getGqlClient } from '@/lib/graphql-client';
import { GET_LISTING } from '@/graphql/queries';
import { ListingDrawer } from '@/components/ui/ListingDrawer';
import { ListingDetailContent } from '@/components/listing/ListingDetailContent';

interface Props { params: { slug: string } }

async function getListing(slug: string) {
  try {
    const data = await getGqlClient().request(GET_LISTING, { slug });
    return (data as any).listing;
  } catch {
    return null;
  }
}

export default async function ListingModalPage({ params }: Props) {
  const listing = await getListing(params.slug);
  if (!listing) return null;

  return (
    <ListingDrawer slug={params.slug}>
      <ListingDetailContent listing={listing} mode="drawer" />
    </ListingDrawer>
  );
}
