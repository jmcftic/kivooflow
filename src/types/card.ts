// Card Types
export interface Card {
  id: string;
  user_id: string;
  payco_card_id: string;
  payco_account_id: string;
  card_number: string;
  card_number_masked: string;
  card_status: CardStatus;
  card_type: CardType;
  balance: number;
  available_balance: number;
  currency: string;
  expiry_date: string;
  activated_at?: string;
  blocked_at?: string;
  created_at: string;
  updated_at: string;
}

export type CardStatus = "pending" | "active" | "blocked" | "expired";
export type CardType = "virtual" | "physical";

export interface CreateCardRequest {
  card_type: CardType;
}

export interface ActivateCardRequest {
  card_id: string;
}

export interface BlockCardRequest {
  card_id: string;
  reason?: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  user_id: string;
  card_id?: string;
  transaction_type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  external_reference?: string;
  payco_transaction_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  processed_at?: string;
}

export type TransactionType = "deposit" | "expense" | "transfer" | "reward";
export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled";

export interface CreateTransactionRequest {
  card_id: string;
  transaction_type: TransactionType;
  amount: number;
  description: string;
  external_reference?: string;
}
