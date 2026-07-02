import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { emailMessages, getSelectedEmailData } from "./mail-list-messages";

export function MailViewMessageBody() {
  const [selectedEmailId, setSelectedEmailId] = useState<string>('');

  useEffect(() => {
    const handleEmailSelected = (event: CustomEvent) => {
      setSelectedEmailId(event.detail.emailId);
    };

    window.addEventListener('emailSelected', handleEmailSelected as EventListener);
    return () => {
      window.removeEventListener('emailSelected', handleEmailSelected as EventListener);
    };
  }, []);

  const email = getSelectedEmailData(selectedEmailId) || emailMessages[0];
  if (!email) return null;

  return (
    <div className="px-4 py-6">
      <div className="bg-secondary p-6 rounded-lg">
        <h3 className="font-medium mb-4">Hi,</h3>
        <p className="text-sm mb-6 whitespace-pre-line">{email.body || 'No message content.'}</p>
        <Button variant="mono" className="mx-auto block">
          Register Here
        </Button>
      </div>
    </div>
  );
}
