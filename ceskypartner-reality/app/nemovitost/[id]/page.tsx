import ListingDetailContent, { generateCzechMetadata } from "@/components/ListingDetailContent";

export const revalidate = 60;
export const generateMetadata = generateCzechMetadata;

type PageProps = { params: { id: string } };

export default function ListingDetailPage({ params }: PageProps) {
  return <ListingDetailContent params={params} locale="cs" />;
}
