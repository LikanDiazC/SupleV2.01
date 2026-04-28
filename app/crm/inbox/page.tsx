'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Inbox, Mail, Search } from 'lucide-react';
import { type InboxEmail } from '@/types';
import { fetchInboxEmails } from '@/services/api/inbox';
import { formatRelativeTime } from '@/lib/utils';

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function senderName(raw: string): string {
  const match = raw.match(/^([^<]+)</);
  return match ? match[1].trim() : raw.replace(/<[^>]+>/g, '').trim();
}

function senderEmail(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  return match ? match[1] : raw;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'h-10 w-10 text-sm' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-xs';
  return (
    <div className={`${sz} ${avatarColor(name)} flex shrink-0 items-center justify-center rounded-full font-bold`}>
      {initials(name)}
    </div>
  );
}

function EmailBody({ email }: { email: InboxEmail }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const hasHtml = !!email.bodyHtml?.trim();

  useEffect(() => {
    if (!hasHtml || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6; margin: 0; padding: 24px; }
            img { max-width: 100%; height: auto; }
            a { color: #6366f1; }
            table { max-width: 100% !important; }
          </style>
        </head>
        <body>${email.bodyHtml}</body>
      </html>
    `);
    doc.close();

    // auto-resize
    const resize = () => {
      if (iframeRef.current && doc.body) {
        iframeRef.current.style.height = doc.body.scrollHeight + 32 + 'px';
      }
    };
    setTimeout(resize, 100);
  }, [email.bodyHtml, hasHtml]);

  if (hasHtml) {
    return (
      <iframe
        ref={iframeRef}
        sandbox="allow-same-origin"
        className="w-full border-0"
        style={{ minHeight: '300px' }}
        title="Contenido del correo"
      />
    );
  }

  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
      {decodeHtmlEntities(email.preview ?? 'Este correo no tiene cuerpo de texto.')}
    </p>
  );
}

export default function InboxPage() {
  const [emails, setEmails]             = useState<InboxEmail[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedEmail, setSelectedEmail] = useState<InboxEmail | null>(null);

  useEffect(() => {
    fetchInboxEmails().then(data => {
      setEmails(data);
      if (data.length > 0) setSelectedEmail(data[0]);
      setLoading(false);
    });
  }, []);

  const filtered = emails.filter(e =>
    e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.from.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <DashboardLayout title="Bandeja de Entrada" subtitle="CRM · Comunicaciones Centralizadas">
      <div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* ── Left pane ──────────────────────────────────────────────────── */}
        <div className="flex w-[340px] shrink-0 flex-col border-r border-slate-100">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar correos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3 border-b border-slate-100 p-3 animate-pulse">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-2.5 w-1/2 rounded bg-slate-200" />
                    <div className="h-2.5 w-3/4 rounded bg-slate-200" />
                    <div className="h-2 w-full rounded bg-slate-100" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                <Mail className="h-8 w-8 opacity-20" />
                <p className="text-xs font-medium">Bandeja vacía</p>
              </div>
            ) : (
              filtered.map(email => {
                const name      = senderName(email.from);
                const isActive  = selectedEmail?.id === email.id;
                return (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`w-full text-left flex gap-3 border-b border-slate-100 p-3 transition-colors hover:bg-slate-50 ${isActive ? 'bg-brand-50 border-l-[3px] border-l-brand-500 pl-[9px]' : ''}`}
                  >
                    <Avatar name={name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="truncate text-xs font-semibold text-slate-800">{name}</span>
                        <span className="shrink-0 text-[10px] text-slate-400">{formatRelativeTime(email.receivedAt)}</span>
                      </div>
                      <p className="truncate text-xs font-medium text-slate-600">{email.subject}</p>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                        {decodeHtmlEntities(email.preview ?? '')}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right pane ─────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {selectedEmail ? (
            <>
              {/* Header — sticky */}
              <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-6 py-5">
                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedEmail.subject}
                </h2>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name={senderName(selectedEmail.from)} size="lg" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{senderName(selectedEmail.from)}</p>
                    <p className="text-xs text-slate-500">{senderEmail(selectedEmail.from)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(selectedEmail.receivedAt).toLocaleString('es-CL', {
                        weekday: 'short', day: '2-digit', month: 'short',
                        year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body — fluye sin scroll propio */}
              <div className="px-6 py-5">
                <EmailBody email={selectedEmail} />
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-300">
              <Inbox className="h-14 w-14 opacity-30" />
              <p className="text-sm font-medium text-slate-400">Selecciona un correo para leerlo</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
