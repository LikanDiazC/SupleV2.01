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

// ─── Products ────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export type ItemType = 'MATERIAL' | 'PRODUCT';

export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  type: ItemType;
  unitOfMeasure?: string;
  unitCost?: number;
  stock: number;
  createdAt: string;
}

export interface CreateInventoryItemPayload {
  name: string;
  sku?: string;
  type: ItemType;
  unitOfMeasure?: string;
  unitCost?: number;
  stock?: number;
}

// ─── BOMs / Recetas ──────────────────────────────────────────────────────────

export interface BomComponent {
  materialId: string;
  quantity: number;
}

export interface Bom {
  id: string;
  name: string;
  productId?: string;
  components: BomComponent[];
  createdAt: string;
}

export interface CreateBomPayload {
  name: string;
  productId?: string;
  components: BomComponent[];
}

// ─── Production Orders ────────────────────────────────────────────────────────

export type OrderStatus =
  | 'ORDER_RECEIVED'
  | 'CHECKING_STOCK'
  | 'IN_PRODUCTION'
  | 'MANUFACTURED'
  | 'SHIPPED'
  | 'CANCELLED';

export interface ProductionOrder {
  id: string;
  reference?: string;
  dealId?: string;
  clientName?: string;
  status: OrderStatus;
  productName?: string;
  quantity?: number;
  startedAt?: string;
  estimatedEnd?: string;
  createdAt: string;
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface CreateDealPayload {
  name: string;
  amount: number;
  stage: DealStage;
  contactId?: string;
  companyId?: string;
  items?: DealItem[];
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

export interface PipelineMetrics {
  activeDeals: number;
  pipelineValue: number;
  closeRate: number;
  aiEmails: number;
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
