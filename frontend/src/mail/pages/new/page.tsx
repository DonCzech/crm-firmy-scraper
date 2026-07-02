import { ComposeMessage } from "../../layout/components/compose-message";

export function NewMailPage() {
  return (
    <div className="flex grow items-center justify-center min-h-[calc(100vh-9rem)]">
      <ComposeMessage initialOpen trigger={<span />} />
    </div>
  );
}
