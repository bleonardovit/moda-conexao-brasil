
export interface Payment {
  id: string;
  date: string;
  amount: number; // Or string if it comes as formatted string
  method: 'card' | 'pix' | 'bankslip' | string; // Allow other strings
  status: 'success' | 'failed' | 'pending' | string; // Allow other strings
  // Add other relevant payment fields like description or transaction_id if needed
  description?: string;
  transaction_id?: string;
}

