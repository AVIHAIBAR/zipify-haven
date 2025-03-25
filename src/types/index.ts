export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Document {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  status: 'draft' | 'pending' | 'completed';
  fileUrl: string;
  fileType: string;
  fileSize: number;
  updatedAt: string;
}

export interface SignatureField {
  id: string;
  documentId: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'signature' | 'initial' | 'date' | 'text' | 'checkbox';
  assignedTo: string;
  value?: string;
  required: boolean;
  completed: boolean;
}

export interface Signer {
  id: string;
  email: string;
  name: string;
  documentId: string;
  status: 'pending' | 'completed';
  signUrl: string;
  completedAt?: string | null;
}
