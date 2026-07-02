import { MailListMessages } from "../../layout/components/mail-list-messages";
import { MailViewMessage } from "../../layout/components/mail-view-message";

export function SentPage() {
  return (
    <div className="flex grow gap-1 relative min-w-0 overflow-hidden">
      <MailListMessages />
      <MailViewMessage />
    </div>
  );
}
