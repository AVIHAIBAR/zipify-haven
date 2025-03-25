import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Document, Page } from 'react-pdf';
import { useDocument } from '../../contexts/DocumentContext';
import FieldInput from '../../components/signing/FieldInput';
import { SignatureField, Signer } from '../../types';

const DocumentSign: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { documentId, signerId } = useParams<{ documentId: string; signerId: string }>();
  
  const { 
    getDocumentForSigning, 
    currentDocument, 
    signatureFields,
    completeField,
    completeSigningProcess,
    loading 
  } = useDocument();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentSigner, setCurrentSigner] = useState<Signer | null>(null);
  const [completedFields, setCompletedFields] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  
  useEffect(() => {
    if (documentId && signerId) {
      getDocumentForSigning(documentId, signerId)
        .then(signer => {
          setCurrentSigner(signer);
        })
        .catch(err => {
          console.error('Failed to load document for signing:', err);
          setError('Failed to load document. The link may be invalid or expired.');
        });
    }
  }, [documentId, signerId, getDocumentForSigning]);
  
  // Group fields by page
  const fieldsByPage: Record<number, SignatureField[]> = {};
  
  signatureFields.forEach(field => {
    if (!fieldsByPage[field.page]) {
      fieldsByPage[field.page] = [];
    }
    fieldsByPage[field.page].push(field);
  });
  
  // Get pages with fields
  const pagesWithFields = Object.keys(fieldsByPage).map(Number).sort((a, b) => a - b);
  
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  
  const handlePageChange = (newPage: number) => {
    if (numPages && newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleFieldComplete = async (fieldId: string, value: string) => {
    if (!documentId || !signerId) return;
    
    try {
      await completeField(documentId, signerId, fieldId, value);
      setCompletedFields(prev => [...prev, fieldId]);
    } catch (err) {
      console.error('Failed to complete field:', err);
      setError('Failed to save field value');
    }
  };
  
  const handleComplete = async () => {
    if (!documentId || !signerId) return;
    
    // Check if all required fields are completed
    const requiredFields = signatureFields.filter(field => field.required && field.assignedTo === signerId);
    const allRequiredCompleted = requiredFields.every(field => completedFields.includes(field.id));
    
    if (!allRequiredCompleted) {
      setError('Please complete all required fields before submitting');
      return;
    }
    
    try {
      await completeSigningProcess(documentId, signerId);
      setSuccess('Document signed successfully!');
      setActiveStep(1);
    } catch (err) {
      console.error('Failed to complete signing process:', err);
      setError('Failed to submit signed document');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentDocument || !currentSigner) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            {error || 'Document not found'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Sign Document</StepLabel>
        </Step>
        <Step>
          <StepLabel>Confirmation</StepLabel>
        </Step>
      </Stepper>
      
      {activeStep === 0 ? (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {currentDocument.name}
            </Typography>
            
            <Typography variant="body1">
              Hello {currentSigner.name}, please review and sign this document.
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 2 }}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      variant="outlined"
                      size="small"
                    >
                      Previous
                    </Button>
                    <Typography variant="body2" sx={{ mx: 2 }}>
                      Page {currentPage} of {numPages || '?'}
                    </Typography>
                    <Button
                      disabled={!numPages || currentPage === numPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      variant="outlined"
                      size="small"
                    >
                      Next
                    </Button>
                  </Box>
                  
                  {pagesWithFields.includes(currentPage) && (
                    <Typography variant="body2" color="primary">
                      This page has fields to complete
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: '#f5f5f5',
                  minHeight: 500,
                  overflow: 'auto'
                }}>
                  <Document
                    file={currentDocument.fileUrl}
                    onLoadSuccess={handleDocumentLoadSuccess}
                    loading={
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
                        <CircularProgress />
                      </Box>
                    }
                  >
                    <Page 
                      pageNumber={currentPage} 
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={600}
                    />
                  </Document>
                </Box>
              </Paper>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleComplete}
                >
                  Complete Signing
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Fields to Complete
                </Typography>
                
                {pagesWithFields.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                    No fields to complete
                  </Typography>
                ) : (
                  <Box>
                    {pagesWithFields.map(page => (
                      <Box key={page} sx={{ mb: 3 }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 1
                          }}
                        >
                          <Typography variant="subtitle2">
                            Page {page}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => setCurrentPage(page)}
                            variant={currentPage === page ? 'contained' : 'outlined'}
                          >
                            View
                          </Button>
                        </Box>
                        
                        {fieldsByPage[page]
                          .filter(field => field.assignedTo === signerId)
                          .map(field => (
                            <Box 
                              key={field.id} 
                              sx={{ 
                                p: 2, 
                                mb: 2, 
                                border: '1px solid',
                                borderColor: completedFields.includes(field.id) ? 'success.main' : 'divider',
                                borderRadius: 1,
                                bgcolor: completedFields.includes(field.id) ? 'success.light' : 'background.paper'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">
                                  {field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field
                                </Typography>
                                
                                {completedFields.includes(field.id) && (
                                  <CheckCircleIcon color="success" fontSize="small" />
                                )}
                              </Box>
                              
                              <FieldInput 
                                field={field}
                                onComplete={handleFieldComplete}
                              />
                            </Box>
                          ))}
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </>
      ) : (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          
          <Typography variant="h4" gutterBottom>
            Document Signed Successfully!
          </Typography>
          
          <Typography variant="body1" paragraph>
            Thank you for signing "{currentDocument.name}".
          </Typography>
          
          <Typography variant="body2" color="textSecondary" paragraph>
            A copy of the signed document has been sent to your email.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default DocumentSign;
