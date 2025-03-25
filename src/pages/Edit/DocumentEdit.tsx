import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import CreateIcon from '@mui/icons-material/Create';
import { useDocument } from '../../contexts/DocumentContext';
import { useAuth } from '../../contexts/AuthContext';
import DocumentEditor from '../../components/signature/DocumentEditor';
import SignerManagement from '../../components/signature/SignerManagement';
import SignerFieldAssignment from '../../components/signature/SignerFieldAssignment';
import SignaturePad from '../../components/signing/SignaturePad';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const DocumentEdit: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { currentUser } = useAuth();
  const { 
    getDocument, 
    currentDocument, 
    signatureFields, 
    signers,
    uploaderAsSigner,
    addSignatureField,
    updateSignatureField,
    deleteSignatureField,
    addSigner,
    deleteSigner,
    toggleUploaderAsSigner,
    completeUploaderSignature,
    sendDocument,
    loading 
  } = useDocument();
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  
  // Fix: Add a document loaded flag to prevent multiple calls to getDocument
  const [documentLoaded, setDocumentLoaded] = useState(false);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Fix: Only load the document if it hasn't been loaded yet and documentId exists
    if (documentId && !documentLoaded) {
      getDocument(documentId)
        .then(() => {
          setDocumentLoaded(true);
        })
        .catch(err => {
          console.error('Failed to load document:', err);
          setError('Failed to load document');
        });
    }
  }, [documentId, getDocument, currentUser, navigate, documentLoaded]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleSendDocument = async () => {
    if (!documentId) return;
    
    if (signers.length === 0) {
      setError('You need to add at least one signer before sending the document');
      return;
    }
    
    if (signatureFields.length === 0) {
      setError('You need to add at least one signature field before sending the document');
      return;
    }
    
    // Check if all fields are assigned to signers
    const unassignedFields = signatureFields.filter(field => !field.assignedTo);
    if (unassignedFields.length > 0) {
      setError('All signature fields must be assigned to a signer');
      return;
    }
    
    try {
      await sendDocument(documentId);
      setSuccess('Document sent successfully! All signers will receive an email with instructions.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Failed to send document:', err);
      setError('Failed to send document');
    }
  };
  
  const handleSignNow = () => {
    // Find signature fields assigned to the uploader
    const uploaderSignerId = signers.find(signer => 
      currentUser && signer.email === currentUser.email
    )?.id;
    
    if (!uploaderSignerId) {
      setError('You need to add yourself as a signer first');
      return;
    }
    
    const uploaderFields = signatureFields.filter(field => 
      field.assignedTo === uploaderSignerId && field.type === 'signature'
    );
    
    if (uploaderFields.length === 0) {
      setError('You need to add at least one signature field for yourself');
      return;
    }
    
    // Select the first signature field
    setSelectedFieldId(uploaderFields[0].id);
    setShowSignaturePad(true);
  };
  
  const handleSignatureComplete = async (signatureDataUrl: string) => {
    if (!documentId || !selectedFieldId) return;
    
    try {
      await completeUploaderSignature(documentId, selectedFieldId, signatureDataUrl);
      setShowSignaturePad(false);
      setSelectedFieldId(null);
      setSuccess('Signature added successfully!');
    } catch (err) {
      console.error('Failed to add signature:', err);
      setError('Failed to add signature');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentDocument) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Document not found
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // Find if the current user (uploader) is already in the signers list
  const uploaderSigner = signers.find(signer => 
    currentUser && signer.email === currentUser.email
  );
  
  // Check if uploader has signature fields
  const hasUploaderSignatureFields = uploaderSigner && signatureFields.some(
    field => field.assignedTo === uploaderSigner.id && field.type === 'signature'
  );
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {currentDocument.name}
          </Typography>
          <Box>
            {uploaderAsSigner && hasUploaderSignatureFields && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<CreateIcon />}
                onClick={handleSignNow}
                sx={{ mr: 2 }}
              >
                Sign Now
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={handleSendDocument}
              disabled={signers.length === 0 || signatureFields.length === 0}
            >
              Send for Signature
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Typography variant="body2" color="textSecondary">
          Add signature fields to your document and assign signers before sending.
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: 'calc(100vh - 200px)' }}>
            <DocumentEditor
              documentId={documentId || ''}
              documentUrl={currentDocument.fileUrl}
              fields={signatureFields}
              signers={signers}
              onAddField={addSignatureField}
              onUpdateField={updateSignatureField}
              onDeleteField={deleteSignatureField}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ borderRadius: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Signers" />
              <Tab label="Fields" />
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                <SignerManagement
                  documentId={documentId || ''}
                  signers={signers}
                  onAddSigner={addSigner}
                  onDeleteSigner={deleteSigner}
                  uploaderAsSigner={uploaderAsSigner}
                  onToggleUploaderAsSigner={toggleUploaderAsSigner}
                />
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <SignerFieldAssignment
                  documentId={documentId || ''}
                  signers={signers}
                  fields={signatureFields}
                  onUpdateField={updateSignatureField}
                />
              </TabPanel>
            </Box>
          </Paper>
          
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Signature Fields ({signatureFields.length})
              </Typography>
              
              {signatureFields.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                  No fields added yet. Click on the document to add signature fields.
                </Typography>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" paragraph>
                    Fields by type:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['signature', 'text', 'date', 'checkbox'].map(type => {
                      const count = signatureFields.filter(field => field.type === type).length;
                      if (count === 0) return null;
                      
                      return (
                        <Box 
                          key={type}
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.contrastText',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.875rem'
                          }}
                        >
                          {type}: {count}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Signature Pad Dialog */}
      {showSignaturePad && (
        <Dialog
          open={showSignaturePad}
          onClose={() => setShowSignaturePad(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <SignaturePad
              onSave={handleSignatureComplete}
              onCancel={() => setShowSignaturePad(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
};

export default DocumentEdit;
