// ─── Deal / CRM ──────────────────────────────────────────────────────────────

export type DealStage =
  | 'NUEVO'
  | 'REUNION_AGENDADA'
  | 'PROPUESTA_ENVIADA'
  | 'GANADO'
  | 'PERDIDO';

export interface DealItem {
  productId: string;
  quantity: number;
}

export interface Deal {
  id: string;
  name: string;
  amount: number;
  stage: DealStage;
  contactId?: string;
  companyId?: string;
  items?: DealItem[];
  lastAiActivity?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Contacts / Companies ────────────────────────────────────────────────────

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyId?: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
}

// ─── Products / Inventory ────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
}

// ─── API helpers ─────────────────────────────────────────────────────────────

export interface CreateDealPayload {
  name: string;
  amount: number;
  stage: DealStage;
  contactId?: string;
  companyId?: string;
  items?: DealItem[];
}

export interface PipelineMetrics {
  activeDeals: number;
  pipelineValue: number;
  closeRate: number;
  aiEmails: number;
}

// ─── Production Orders ────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'IN_PRODUCTION'
  | 'QUALITY_CHECK'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ProductionOrder {
  id: string;
  dealId?: string;
  status: OrderStatus;
  productName?: string;
  quantity?: number;
  startedAt?: string;
  estimatedEnd?: string;
  createdAt: string;
}

// ─── Inbox / Emails ──────────────────────────────────────────────────────────

export interface InboxEmail {
  id: string;
  from: string;
  subject: string;
  preview?: string;
  receivedAt: string;
  read: boolean;
  aiSuggestion?: string;
}

// ─── AI Copilot ──────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

export interface KanbanColumn {
  stage: DealStage;
  label: string;
  color: string;
  dotColor: string;
}
