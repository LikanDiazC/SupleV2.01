import { Inbox, Circle } from 'lucide-react';
import { type InboxEmail } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import WidgetCard from './WidgetCard';
import EmptyState from '@/components/ui/EmptyState';
import { EmailAvatar } from '@/components/ui/EmailAvatar';

function EmailRow({ email }: { email: InboxEmail }) {
  return (
    <div className="group flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-slate-50">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
        <EmailAvatar rawSender={email.from} className="h-full w-full" size={64} />
        {!email.read && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-brand-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-xs font-semibold text-slate-800">{email.from}</p>
          <span className="shrink-0 text-[10px] text-slate-400">{formatRelativeTime(email.receivedAt)}</span>
        </div>
        <p className="truncate text-[11px] text-slate-500">{email.subject}</p>
        {email.aiSuggestion && (
          <p className="mt-0.5 truncate text-[10px] text-emerald-600">
            ✦ {email.aiSuggestion}
          </p>
        )}
      </div>
    </div>
  );
}

export default function InboxWidget({
  emails,
  loading,
}: {
  emails: InboxEmail[];
  loading: boolean;
}) {
  return (
    <WidgetCard
      title="Bandeja Rápida"
      icon={Inbox}
      iconColor="text-indigo-600"
      iconBg="bg-indigo-50"
      href="/crm/inbox"
      loading={loading}
    >
      {emails.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Bandeja vacía"
          description="Los correos entrantes aparecerán aquí."
        />
      ) : (
        <div className="-mx-2.5 space-y-0.5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
          {emails.map((email) => (
            <EmailRow key={email.id} email={email} />
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
