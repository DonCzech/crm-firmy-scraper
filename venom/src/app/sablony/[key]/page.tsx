import { permanentRedirect } from "next/navigation";

interface Props {
  params: Promise<{ key: string }>;
}

/** Legacy URL — permanent redirect (HTTP 308) to the new design at /ukazka-sablon/[key]. */
export default async function LegacyTemplateRedirect({ params }: Props) {
  const { key } = await params;
  permanentRedirect(`/ukazka-sablon/${key}`);
}
