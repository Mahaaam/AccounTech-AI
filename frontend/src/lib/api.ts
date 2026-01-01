import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Account {
  id: number
  code: string
  name: string
  account_type: string
  balance: number
  is_active: boolean
  created_at: string
  parent_id?: number | null
}

export interface Transaction {
  id: number
  account_id: number
  transaction_type: string
  amount: number
  description?: string
}

export interface JournalEntry {
  id: number
  entry_number: string
  date: string
  description: string
  reference?: string
  source: string
  transactions: Transaction[]
  created_at: string
}

export interface DashboardStats {
  total_entries: number
  total_accounts: number
  total_debit: number
  total_credit: number
  balance_difference: number
  recent_entries: JournalEntry[]
}

export interface TrialBalanceItem {
  account_code: string
  account_name: string
  debit: number
  credit: number
  balance: number
}

export interface LedgerItem {
  date: string
  entry_number: string
  description: string
  debit: number
  credit: number
  balance: number
}

export const accountsApi = {
  getAll: () => api.get<Account[]>('/accounts'),
  getById: (id: number) => api.get<Account>(`/accounts/${id}`),
  create: (data: Partial<Account>) => api.post<Account>('/accounts', data),
  update: (id: number, data: Partial<Account>) => api.put<Account>(`/accounts/${id}`, data),
  delete: (id: number) => api.delete(`/accounts/${id}`),
}

export const journalApi = {
  getAll: (params?: { start_date?: string; end_date?: string }) => 
    api.get<JournalEntry[]>('/journal', { params }),
  getById: (id: number) => api.get<JournalEntry>(`/journal/${id}`),
  create: (data: any) => api.post<JournalEntry>('/journal', data),
  update: (id: number, data: any) => api.put<JournalEntry>(`/journal/${id}`, data),
  delete: (id: number) => api.delete(`/journal/${id}`),
}

export const voiceApi = {
  process: (text: string) => api.post('/voice/process', { text }),
  uploadAudio: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/voice/upload-audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const ocrApi = {
  processReceipt: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/ocr/process-receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getReceipts: () => api.get('/ocr/receipts'),
  createEntry: (receiptId: number, data: any) => 
    api.post(`/ocr/receipts/${receiptId}/create-entry`, data),
}

export const reportsApi = {
  getTrialBalance: () => api.get<TrialBalanceItem[]>('/reports/trial-balance'),
  getLedger: (accountId: number, params?: { start_date?: string; end_date?: string }) =>
    api.get<LedgerItem[]>(`/reports/ledger/${accountId}`, { params }),
  getDashboard: () => api.get<DashboardStats>('/reports/dashboard'),
}

export default api
