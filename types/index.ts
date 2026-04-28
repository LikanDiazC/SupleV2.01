// ─── Deal / CRM ──────────────────────────────────────────────────────────────

export type DealStage =
  | 'NUEVO'
  | 'REUNION_AGENDADA'
  | 'PROPUESTA_ENVIADA'
  | 'GANADO'
  | 'PERDIDO';

export interface DealItem {
  bomId:    string;
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

// ─── Products (tabla `products`) ─────────────────────────────────────────────

export interface Product {
  id: string;
  tenantId?: string;
  name: string;
  sku: string;
  description?: string;
  price?: number;   // alias de salePrice para UI
  salePrice?: number;
  stock: number;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  description?: string;
  salePrice?: number;
  stock: number;
}

// ─── Materials (tabla `materials`) ───────────────────────────────────────────

export type MaterialType      = 'SHEET' | 'HARDWARE' | 'CONSUMABLE';
export type GrainDirection    = 'HORIZONTAL' | 'VERTICAL' | 'NONE';

export interface Material {
  id: string;
  tenantId?: string;
  name: string;
  sku: string;
  materialType: MaterialType;
  unitOfMeasure: string;
  unitCost: number;
  stock: number;
  // Solo para SHEET:
  sheetWidthMm?: number;
  sheetHeightMm?: number;
  thicknessMm?: number;
  grainDirection?: GrainDirection;
  kerfMm?: number;
  minRemnantAreaMm2?: number;
}

export interface CreateMaterialPayload {
  name: string;
  sku: string;
  materialType: MaterialType;
  unitOfMeasure: string;
  unitCost: number;
  stock: number;
  sheetWidthMm?: number;
  sheetHeightMm?: number;
  thicknessMm?: number;
  grainDirection?: GrainDirection;
  kerfMm?: number;
  minRemnantAreaMm2?: number;
}

// ─── Legacy Inventory (tabla `items`) ────────────────────────────────────────

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

export type GrainRequirement = 'FOLLOW' | 'CROSS' | 'ANY';

export interface BomComponent {
  materialId: string;
  materialName?: string;
  quantity: number;
  pieceWidthMm?: number;
  pieceHeightMm?: number;
  grainRequirement?: GrainRequirement;
  pieceLabel?: string;
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
  productName: string;
  productSku?: string;
  components: BomComponent[];
}

// ─── Production Orders ────────────────────────────────────────────────────────

export type OrderStatus =
  | 'ORDER_RECEIVED'
  | 'CHECKING_STOCK'
  | 'ON_HOLD_MATERIALS'
  | 'READY_TO_START'
  | 'IN_PRODUCTION'
  | 'MANUFACTURED'
  | 'SHIPPED'
  | 'DELIVERED';

export interface ProductionOrder {
  id: string;
  reference?: string;
  clientName?: string;
  status: OrderStatus;
  productName?: string;
  quantity?: number;
  items?: DealItem[];
  createdAt: string;
  updatedAt?: string;
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
  id:           string;
  from:         string;
  subject:      string;
  preview?:     string;
  bodyHtml?:    string;
  receivedAt:   string;
  read:         boolean;
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

// ─── HR ───────────────────────────────────────────────────────────────────────

export type HrRole     = 'OWNER' | 'MANAGER' | 'EMPLOYEE';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface TeamMember {
  id:           string;
  userId:       string;
  firstName:    string;
  lastName:     string;
  email:        string;
  hrRole:       HrRole;
  position:     string | null;
  managerId:    string | null;
  pendingTasks: number;
  totalTasks:   number;
  isOnline:     boolean;
  lastSeenAt:   string | null;
}

export interface HrTask {
  id:          string;
  title:       string;
  description: string | null;
  status:      TaskStatus;
  dueDate:     string | null;
  createdById: string;
  createdAt:   string;
  updatedAt:   string;
}

export interface CreateTaskPayload {
  title:        string;
  description?: string;
  assignedToId: string;
  dueDate?:     string;
}

// ─── Remnants ─────────────────────────────────────────────────────────────────

export interface Remnant {
  id: string;
  materialId: string;
  materialName: string;
  widthMm: number;
  heightMm: number;
  areaMm2: number;
  stock: number;
  sourceOrderId: string;
  createdAt: string;
}

// ─── Cutting Preview ─────────────────────────────────────────────────────────

export interface CuttingRemnant {
  sheetIndex: number;
  x: number;
  y: number;
  widthMm: number;
  heightMm: number;
}

export interface PlacedPiece {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotated: boolean;
}

export interface SheetLayout {
  sheetIndex: number;
  pieces: PlacedPiece[];
}

export interface MaterialCuttingPreview {
  materialId: string;
  materialName: string;
  sheetWidthMm: number;
  sheetHeightMm: number;
  sheetsUsed: number;
  wastePercent: number;
  layouts: SheetLayout[];
  remnants: CuttingRemnant[];
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

export interface KanbanColumn {
  stage: DealStage;
  label: string;
  color: string;
  dotColor: string;
}
