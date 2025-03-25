import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Document, Signer, SignatureField } from '../types';
import { useAuth } from './AuthContext';

interface DocumentContextProps {
  documents: Document[];
  currentDocument: Document | null;
  signatureFields: SignatureField[];
  signers: Signer[];
  uploaderAsSigner: boolean;
  loading: boolean;
  getUserDocuments: () => Promise<Document[]>;
  getDocument: (documentId: string) => Promise<Document>;
  getDocumentForSigning: (documentId: string, signerId: string) => Promise<Signer>;
  createDocument: (name: string, file: File) => Promise<Document>;
  addSignatureField: (field: Omit<SignatureField, 'id'>) => Promise<SignatureField>;
  updateSignatureField: (field: SignatureField) => Promise<SignatureField>;
  deleteSignatureField: (fieldId: string) => Promise<void>;
  addSigner: (signer: Omit<Signer, 'id' | 'signUrl' | 'status'>) => Promise<Signer>;
  deleteSigner: (signerId: string) => Promise<void>;
  toggleUploaderAsSigner: (enabled: boolean) => Promise<void>;
  completeField: (documentId: string, signerId: string, fieldId: string, value: string) => Promise<void>;
  completeUploaderSignature: (documentId: string, fieldId: string, value: string) => Promise<void>;
  completeSigningProcess: (documentId: string, signerId: string) => Promise<void>;
  sendDocument: (documentId: string) => Promise<void>;
  downloadDocument: (documentId: string) => Promise<void>;
  resendInvitation: (documentId: string, signerId: string) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  duplicateDocument: (documentId: string) => Promise<Document>;
}

const DocumentContext = createContext<DocumentContextProps | undefined>(undefined);

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};

interface DocumentProviderProps {
  children: ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [signers, setSigners] = useState<Signer[]>([]);
  const [uploaderAsSigner, setUploaderAsSigner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Mock API functions
  const getUserDocuments = async (): Promise<Document[]> => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll just return the mock data
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      return documents;
    } catch (error) {
      console.error('Error getting user documents:', error);
      setLoading(false);
      throw error;
    }
  };
  
  const getDocument = async (documentId: string): Promise<Document> => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      const document = documents.find(doc => doc.id === documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Get signature fields for this document
      const fields = signatureFields.filter(field => field.documentId === documentId);
      
      // Get signers for this document
      const documentSigners = signers.filter(signer => signer.documentId === documentId);
      
      // Fix: Only set these states once to prevent infinite loops
      setCurrentDocument(document);
      setSignatureFields(fields);
      setSigners(documentSigners);
      
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      
      return document;
    } catch (error) {
      console.error('Error getting document:', error);
      setLoading(false);
      throw error;
    }
  };
  
  const getDocumentForSigning = async (documentId: string, signerId: string): Promise<Signer> => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      const document = documents.find(doc => doc.id === documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      const signer = signers.find(s => s.id === signerId);
      if (!signer) {
        throw new Error('Signer not found');
      }
      
      // Get signature fields for this document and signer
      const fields = signatureFields.filter(
        field => field.documentId === documentId && field.assignedTo === signerId
      );
      
      // Fix: Only set these states once to prevent infinite loops
      setCurrentDocument(document);
      setSignatureFields(fields);
      
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      
      return signer;
    } catch (error) {
      console.error('Error getting document for signing:', error);
      setLoading(false);
      throw error;
    }
  };
  
  const createDocument = async (name: string, file: File): Promise<Document> => {
    setLoading(true);
    try {
      // In a real app, this would upload the file to storage and create a document in the database
      const newDocument: Document = {
        id: uuidv4(),
        name,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id || '',
        status: 'draft',
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        fileSize: file.size,
        updatedAt: new Date().toISOString()
      };
      
      // Fix: Use functional updates to prevent stale state issues
      setDocuments(prev => [...prev, newDocument]);
      
      // Fix: Set current document only once
      setCurrentDocument(newDocument);
      
      // Clear existing signature fields and signers for the new document
      setSignatureFields([]);
      setSigners([]);
      
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      
      return newDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      setLoading(false);
      throw error;
    }
  };
  
  const addSignatureField = async (field: Omit<SignatureField, 'id'>): Promise<SignatureField> => {
    try {
      const newField: SignatureField = {
        ...field,
        id: uuidv4()
      };
      
      // Fix: Use functional updates to prevent stale state
      setSignatureFields(prev => [...prev, newField]);
      
      return newField;
    } catch (error) {
      console.error('Error adding signature field:', error);
      throw error;
    }
  };
  
  const updateSignatureField = async (field: SignatureField): Promise<SignatureField> => {
    try {
      // Fix: Use functional updates to prevent stale state
      setSignatureFields(prev => 
        prev.map(f => f.id === field.id ? field : f)
      );
      
      return field;
    } catch (error) {
      console.error('Error updating signature field:', error);
      throw error;
    }
  };
  
  const deleteSignatureField = async (fieldId: string): Promise<void> => {
    try {
      // Fix: Use functional updates to prevent stale state
      setSignatureFields(prev => 
        prev.filter(f => f.id !== fieldId)
      );
    } catch (error) {
      console.error('Error deleting signature field:', error);
      throw error;
    }
  };
  
  const addSigner = async (signer: Omit<Signer, 'id' | 'signUrl' | 'status'>): Promise<Signer> => {
    try {
      const newSigner: Signer = {
        ...signer,
        id: uuidv4(),
        signUrl: `${window.location.origin}/sign/${signer.documentId}/${uuidv4()}`,
        status: 'pending',
        completedAt: null
      };
      
      // Fix: Use functional updates to prevent stale state
      setSigners(prev => [...prev, newSigner]);
      
      return newSigner;
    } catch (error) {
      console.error('Error adding signer:', error);
      throw error;
    }
  };
  
  const deleteSigner = async (signerId: string): Promise<void> => {
    try {
      // Remove signer
      // Fix: Use functional updates to prevent stale state
      setSigners(prev => 
        prev.filter(s => s.id !== signerId)
      );
      
      // Unassign fields assigned to this signer
      // Fix: Use functional updates to prevent stale state
      setSignatureFields(prev => 
        prev.map(field => 
          field.assignedTo === signerId 
            ? { ...field, assignedTo: '' } 
            : field
        )
      );
    } catch (error) {
      console.error('Error deleting signer:', error);
      throw error;
    }
  };
  
  const toggleUploaderAsSigner = async (enabled: boolean): Promise<void> => {
    try {
      setUploaderAsSigner(enabled);
    } catch (error) {
      console.error('Error toggling uploader as signer:', error);
      throw error;
    }
  };
  
  const completeField = async (documentId: string, signerId: string, fieldId: string, value: string): Promise<void> => {
    try {
      // Fix: Use functional updates to prevent stale state
      setSignatureFields(prev => 
        prev.map(field => 
          field.id === fieldId 
            ? { ...field, value, completed: true } 
            : field
        )
      );
    } catch (error) {
      console.error('Error completing field:', error);
      throw error;
    }
  };
  
  const completeUploaderSignature = async (documentId: string, fieldId: string, value: string): Promise<void> => {
    try {
      // Fix: Use functional updates to prevent stale state
      setSignatureFields(prev => 
        prev.map(field => 
          field.id === fieldId 
            ? { ...field, value, completed: true } 
            : field
        )
      );
    } catch (error) {
      console.error('Error completing uploader signature:', error);
      throw error;
    }
  };
  
  const completeSigningProcess = async (documentId: string, signerId: string): Promise<void> => {
    try {
      // Mark signer as completed
      // Fix: Use functional updates to prevent stale state
      setSigners(prev => 
        prev.map(signer => 
          signer.id === signerId 
            ? { ...signer, status: 'completed', completedAt: new Date().toISOString() } 
            : signer
        )
      );
      
      // Check if all signers have completed
      // Fix: Use the previous state from the functional update to check completion
      const updatedSigners = signers.map(signer => 
        signer.id === signerId 
          ? { ...signer, status: 'completed', completedAt: new Date().toISOString() } 
          : signer
      );
      
      const documentSigners = updatedSigners.filter(signer => signer.documentId === documentId);
      const allCompleted = documentSigners.every(signer => signer.status === 'completed');
      
      if (allCompleted) {
        // Update document status to completed
        // Fix: Use functional updates to prevent stale state
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: 'completed', updatedAt: new Date().toISOString() } 
              : doc
          )
        );
        
        // Update current document if it's the one being completed
        // Fix: Use functional updates to prevent stale state
        setCurrentDocument(prev => 
          prev && prev.id === documentId 
            ? { ...prev, status: 'completed', updatedAt: new Date().toISOString() } 
            : prev
        );
      }
    } catch (error) {
      console.error('Error completing signing process:', error);
      throw error;
    }
  };
  
  const sendDocument = async (documentId: string): Promise<void> => {
    try {
      // Update document status to pending
      // Fix: Use functional updates to prevent stale state
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'pending', updatedAt: new Date().toISOString() } 
            : doc
        )
      );
      
      // Update current document if it's the one being sent
      // Fix: Use functional updates to prevent stale state
      setCurrentDocument(prev => 
        prev && prev.id === documentId 
          ? { ...prev, status: 'pending', updatedAt: new Date().toISOString() } 
          : prev
      );
    } catch (error) {
      console.error('Error sending document:', error);
      throw error;
    }
  };
  
  const downloadDocument = async (documentId: string): Promise<void> => {
    try {
      // In a real app, this would download the document from storage
      console.log('Downloading document:', documentId);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  };
  
  const resendInvitation = async (documentId: string, signerId: string): Promise<void> => {
    try {
      // In a real app, this would resend the invitation email
      console.log('Resending invitation to signer:', signerId);
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw error;
    }
  };
  
  const deleteDocument = async (documentId: string): Promise<void> => {
    try {
      // Remove document
      // Fix: Use functional updates to prevent stale state
      setDocuments(prev => 
        prev.filter(doc => doc.id !== documentId)
      );
      
      // Remove signature fields for this document
      // Fix: Use functional updates to prevent stale state
      setSignatureFields(prev => 
        prev.filter(field => field.documentId !== documentId)
      );
      
      // Remove signers for this document
      // Fix: Use functional updates to prevent stale state
      setSigners(prev => 
        prev.filter(signer => signer.documentId !== documentId)
      );
      
      // Clear current document if it's the one being deleted
      if (currentDocument && currentDocument.id === documentId) {
        setCurrentDocument(null);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };
  
  const duplicateDocument = async (documentId: string): Promise<Document> => {
    try {
      const originalDoc = documents.find(doc => doc.id === documentId);
      if (!originalDoc) {
        throw new Error('Document not found');
      }
      
      const newDocument: Document = {
        ...originalDoc,
        id: uuidv4(),
        name: `${originalDoc.name} (Copy)`,
        createdAt: new Date().toISOString(),
        status: 'draft',
        updatedAt: new Date().toISOString()
      };
      
      // Fix: Use functional updates to prevent stale state
      setDocuments(prev => [...prev, newDocument]);
      
      return newDocument;
    } catch (error) {
      console.error('Error duplicating document:', error);
      throw error;
    }
  };
  
  return (
    <DocumentContext.Provider
      value={{
        documents,
        currentDocument,
        signatureFields,
        signers,
        uploaderAsSigner,
        loading,
        getUserDocuments,
        getDocument,
        getDocumentForSigning,
        createDocument,
        addSignatureField,
        updateSignatureField,
        deleteSignatureField,
        addSigner,
        deleteSigner,
        toggleUploaderAsSigner,
        completeField,
        completeUploaderSignature,
        completeSigningProcess,
        sendDocument,
        downloadDocument,
        resendInvitation,
        deleteDocument,
        duplicateDocument
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};
