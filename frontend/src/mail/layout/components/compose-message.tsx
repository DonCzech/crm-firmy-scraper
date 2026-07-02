import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SquarePen, Send, Plus, Sparkles, Type, Bold, Italic, Underline, List, AlignLeft, Undo, Redo, Strikethrough, CircleX, CircleCheck, Loader2 } from 'lucide-react';
import { useState, useRef, type ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Generate } from './generate';
import { createMailMessage, generateMailDraft } from '../../services/backend';
import { findInvalidEmails, parseEmailList } from '../../utils/email';
import { getSelectedMailAccountEmail } from '../../utils/account-selection';

interface ComposeMessageProps {
  trigger?: ReactNode;
  initialOpen?: boolean;
}

export function ComposeMessage({ trigger, initialOpen = false }: ComposeMessageProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [selectedHeading, setSelectedHeading] = useState('P');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [ccEmail, setCcEmail] = useState('');
  const [bccEmail, setBccEmail] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [subject, setSubject] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatHeading = (heading: string) => {
    setSelectedHeading(heading);
  };

  // Generate email content
  const generateEmailContent = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const draft = await generateMailDraft({
        toEmail: emailAddress,
        cc: ccEmail,
        bcc: bccEmail,
        subject,
        body: textareaRef.current?.value || '',
      });
      setGeneratedContent(draft.content);
      if (draft.subject?.trim()) setSubject(draft.subject);
      setShowGenerateModal(true);
    } catch (error) {
      toast.custom((t) => (
        <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <CircleX />
          </AlertIcon>
          <AlertTitle>{error instanceof Error ? error.message : 'Failed to generate email'}</AlertTitle>
        </Alert>
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  // Accept generated content
  const acceptGeneratedContent = () => {
    if (textareaRef.current) {
      textareaRef.current.value = generatedContent;
    }
    setShowGenerateModal(false);
  };

  // Reject generated content
  const rejectGeneratedContent = () => {
    setShowGenerateModal(false);
  };

  const handleSend = async () => {
    if (isSending) return;
    const textarea = textareaRef.current;
    const message = textarea?.value || '';
    const recipient = emailAddress.trim();
    const toList = parseEmailList(recipient);
    const ccList = parseEmailList(ccEmail);
    const bccList = parseEmailList(bccEmail);
    const invalidTo = findInvalidEmails(recipient);
    const invalidCc = findInvalidEmails(ccEmail);
    const invalidBcc = findInvalidEmails(bccEmail);

    if (toList.length === 0 || !message.trim()) {
      toast.custom((t) => (
        <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <CircleX />
          </AlertIcon>
          <AlertTitle>Please fill recipient and message before sending</AlertTitle>
        </Alert>
      ));
      return;
    }

    if (invalidTo.length > 0 || invalidCc.length > 0 || invalidBcc.length > 0) {
      const invalid = [...invalidTo, ...invalidCc, ...invalidBcc];
      toast.custom((t) => (
        <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <CircleX />
          </AlertIcon>
          <AlertTitle>Invalid email address: {invalid[0]}</AlertTitle>
        </Alert>
      ));
      return;
    }

    try {
      setIsSending(true);
      await createMailMessage({
        folder: 'sent',
        toEmail: toList.join(', '),
        cc: ccList.length > 0 ? ccList.join(', ') : undefined,
        bcc: bccList.length > 0 ? bccList.join(', ') : undefined,
        subject: subject || '(No subject)',
        body: message,
        fromName: 'Don',
        fromEmail: getSelectedMailAccountEmail() || undefined,
        isRead: true,
        isStarred: false,
        priority: 'normal',
      });

      toast.custom((t) => (
        <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <CircleCheck />
          </AlertIcon>
          <AlertTitle>
            Email sent to {toList.length === 1 ? toList[0] : `${toList.length} recipients`}
          </AlertTitle>
        </Alert>
      ));

      if (textarea) textarea.value = '';
      setEmailAddress('');
      setCcEmail('');
      setBccEmail('');
      setSubject('');
      setSelectedHeading('P');
      setIsBold(false);
      setIsItalic(false);
      setIsUnderline(false);
      setIsStrikethrough(false);
      setShowCc(false);
      setShowBcc(false);
      setIsOpen(false);
      window.dispatchEvent(new CustomEvent('mailRefresh'));
    } catch (error) {
      toast.custom((t) => (
        <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <CircleX />
          </AlertIcon>
          <AlertTitle>{error instanceof Error ? error.message : 'Failed to send email'}</AlertTitle>
        </Alert>
      ));
    } finally {
      setIsSending(false);
    }
  };

  return (
			<>
			<Dialog open={isOpen} onOpenChange={setIsOpen} modal={true}>
				<DialogTrigger asChild>
          {trigger ?? (
					  <Button variant="primary" className="w-full lg:in-data-[sidebar-collapsed=true]:w-8.5 transition-all duration-300">
						  <SquarePen className="size-3.5" /> 
						  <span className="lg:in-data-[sidebar-collapsed=true]:hidden">New Mail</span>
					  </Button>
          )}
				</DialogTrigger>
			<DialogContent className={cn(
				'max-w-4xl w-full h-[600px] flex flex-col bg-background p-0',
				'[&_[data-slot="dialog-close"]]:size-6! [&_[data-slot="dialog-close"]]:!justify-center [&_[data-slot="dialog-close"]]:!items-center [&_[data-slot="dialog-close"]]:p-0 [&_[data-slot="dialog-close"]]:bg-background [&_[data-slot="dialog-close"]]:rounded-full',
				'[&_[data-slot="dialog-close"]]:-top-6 [&_[data-slot="dialog-close"]]:-end-6 [&_[data-slot="dialog-close"]]:flex [&_[data-slot="dialog-close"]_svg]:size-3.5'
			)}>
				<DialogTitle className="sr-only">New Mail</DialogTitle>
				{/* Combined To field with Cc, Bcc, X */}
				<div className="p-2 border-b">
					<div className="relative">
						<Input 
							placeholder="Enter email" 
							className="w-full bg-background border-none shadow-none ps-8 outline-none focus-visible:ring-0"
							value={emailAddress}
							onChange={(e) => setEmailAddress(e.target.value)}
						/>
						<span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">To:</span>
						<div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
							<span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground font-medium" onClick={() => setShowCc(!showCc)}>Cc</span>
							<span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground font-medium" onClick={() => setShowBcc(!showBcc)}>Bcc</span>
						</div>
					</div>
				</div>

				{/* Cc field - conditional */}
				{showCc && (
					<div className="p-2 border-b">
						<div className="relative">
							<Input 
								placeholder="Enter CC email" 
								className="w-full bg-background border-none shadow-none ps-8 border-0 outline-none focus-visible:ring-0"
								value={ccEmail}
								onChange={(e) => setCcEmail(e.target.value)}
							/>
							<span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">Cc:</span>
						</div>
					</div>
				)}

				{/* Bcc field - conditional */}
				{showBcc && (
					<div className="p-2 border-b">
						<div className="relative">
							<Input 
								placeholder="Enter BCC email" 
								className="w-full bg-background border-none shadow-none ps-10 outline-none focus-visible:ring-0 border-0"
								value={bccEmail}
								onChange={(e) => setBccEmail(e.target.value)}
							/>
							<span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">Bcc:</span>
						</div>
					</div>
				)}

				{/* Subject field */}
				<div className="p-2 pe-0 border-b">
					<div className="relative">
						<Input 
							placeholder="Re: Design review feedback"  
							className="w-full bg-background border-none shadow-none ps-16 outline-none focus-visible:ring-0 border-0"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
						/>
						<span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">Subject:</span>
						<div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
							<Button className="p-0" variant="dim" size="sm" onClick={generateEmailContent} disabled={isGenerating}>
								{isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
							</Button>
						</div>
					</div>
				</div>

				{/* Message body */}
				<div className="flex-1 bg-background border-none shadow-none">
					<Textarea 
						ref={textareaRef}
						placeholder="Type your message here."
						className="w-full h-full resize-none border-0 focus-visible:ring-0 text-sm placeholder:text-sm placeholder:font-normal placeholder:not-italic placeholder:no-underline"
						style={{
							fontSize: selectedHeading === 'H1' ? '2rem' : 
											selectedHeading === 'H2' ? '1.5rem' : 
											selectedHeading === 'H3' ? '1.25rem' : 
											selectedHeading === 'P' ? '1rem' : '1rem',													
							fontWeight: isBold ? 'bold' : 'normal',
							fontStyle: isItalic ? 'italic' : 'normal',
							textDecoration: isUnderline ? 'underline' : isStrikethrough ? 'line-through' : 'none'
						}}
					/>
				</div>

				{/* Bottom toolbar */}
				<div className="flex items-center justify-between p-4 bg-background border-t rounded-b-lg">
					<div className="flex items-center gap-2">
							<Button 
								variant="primary"
                disabled={isSending}
								onClick={() => {
									void handleSend();
								}}
							>
								{isSending ? <Loader2 className="animate-spin" /> : <Send />} Send
							</Button>
							
						<Button variant="outline">
							<Plus />
							Add
						</Button>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline">
									Templates
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Save</p>
							</TooltipContent>
						</Tooltip>
						<DropdownMenu>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" mode="icon">
												<Type />
											</Button>
										</DropdownMenuTrigger>
									</TooltipTrigger>
									<TooltipContent>
										<p>Formatting options</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<DropdownMenuContent align="start" side="top" className="w-auto p-2">
								<div className="flex items-center gap-0.5">
									{/* Undo/Redo */}
									<Button variant="ghost" size="sm" mode="icon">
										<Undo />
									</Button>
									<Button variant="ghost" size="sm" mode="icon">
										<Redo />
									</Button>
									
										{/* Headings */}
										<div className="flex gap-1 ml-2">
											<Button 
												variant="ghost" 
												size="sm" 
												mode="icon"
												className={selectedHeading === 'H1' ? '' : ''}
												onClick={() => formatHeading('H1')}
											>
												H1  
											</Button>
											<Button 
												variant="ghost" 
												size="sm" 
												mode="icon"
												className={selectedHeading === 'H2' ? '' : ''}
												onClick={() => formatHeading('H2')}
											>
												H2
											</Button>
											<Button 
												variant="ghost" 
												size="sm" 
												mode="icon"
												className={selectedHeading === 'H3' ? '' : ''}
												onClick={() => formatHeading('H3')}
											>
												H3
											</Button>
											<Button 
												variant="ghost" 
												size="sm" 
												mode="icon"
												className={selectedHeading === 'P' ? '' : ''}
												onClick={() => formatHeading('P')}
											>
												P
											</Button>
										</div>
									
									{/* Separator */}
									<Separator className="h-6 mx-2" orientation="vertical" />
									
									{/* Text Formatting */}
									<div className="flex gap-0.5">
										<Button 
											variant="ghost" 
											size="sm" 
											mode="icon"
											onClick={() => setIsBold(!isBold)}
										>
											<Bold />
										</Button>
										<Button 
											variant="ghost" 
											size="sm" 
											mode="icon"
											onClick={() => setIsItalic(!isItalic)}
										>
											<Italic />
										</Button>
										<Button 
											variant="ghost" 
											size="sm" 
											mode="icon"
											onClick={() => setIsStrikethrough(!isStrikethrough)}
										>
											<Strikethrough />
										</Button>
										<Button 
											variant="ghost" 
											size="sm" 
											mode="icon"
											onClick={() => setIsUnderline(!isUnderline)}
										>
											<Underline />
										</Button>
									</div>
									
									{/* Separator */}
									<Separator className="h-6 mx-2" orientation="vertical" />
									
									{/* Lists and Alignment */}
									<div className="flex gap-0.5">
										<Button variant="ghost" size="sm" mode="icon">
											<List />
										</Button>
										<Button variant="ghost" size="sm" mode="icon">
											<AlignLeft />
										</Button>
									</div>
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
					<Button 
						variant="outline" 
						onClick={generateEmailContent}
						disabled={isGenerating}
					>
						{isGenerating ? (
							<Loader2 className="animate-spin" />
						) : (
							<Sparkles />
						)}
						{isGenerating ? "Generating..." : "Generate"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
		
		{/* Generate Modal */}
		<Generate 
			generatedContent={generatedContent}
			onAccept={acceptGeneratedContent}
			onReject={rejectGeneratedContent}
			open={showGenerateModal}
			onOpenChange={setShowGenerateModal}
		/>
		</>
  );
}
