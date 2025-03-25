import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Grid,
  TextField,
  Divider,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useDocument } from '../../contexts/DocumentContext';
import { SignatureField, Signer } from '../../types';

const Sign: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { documentId, signerId } = useParams<{ documentId: string, signerId: string }>();
  const { getDocument, currentDocument, signatureFields, updateSignatureField, loading } = useDocument();
  
  const [activeStep, setActiveStep] = useState(0);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [signatureValue, setSignatureValue] = useState('');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  
  // Filter fields assigned to this signer
  const [signerFields, setSignerFields] = useState<SignatureField[]>([]);
  
  useEffect(() => {
    if (documentId) {
      getDocument(documentId).catch(err => {
        console.error('Failed to load document:', err);
        setError('Failed to load document');
      });
    }
  }, [documentId, getDocument]);
  
  useEffect(() => {
    if (signerId && signatureFields.length > 0) {
      const fields = signatureFields.filter(field => field.assignedTo === signerId);
      setSignerFields(fields);
    }
  }, [signerId, signatureFields]);
  
  const steps = ['Review Document', 'Sign Fields', 'Complete'];
  
  const handleNext = () => {
    if (activeStep === 0) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      if (currentFieldIndex < signerFields.length - 1) {
        setCurrentFieldIndex(currentFieldIndex + 1);
      } else {
        setActiveStep(2);
        setCompleted(true);
      }
    }
  };
  
  const handleBack = () => {
    if (activeStep === 1 && currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1);
    } else if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };
  
  const handleSignField = async () => {
    if (!signatureValue.trim()) {
      setError('Please provide a signature');
      return;
    }
    
    const currentField = signerFields[currentFieldIndex];
    
    try {
      await updateSignatureField({
        ...currentField,
        value: signatureValue,
        completed: true
      });
      
      setSignatureValue('');
      setError('');
      handleNext();
    } catch (err) {
      console.error('Failed to sign field:', err);
      setError('Failed to sign field');
    }
  };
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Document Preview
            </Typography>
            <Paper 
              elevation={2} 
              sx={{ 
                height: 400, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 2,
                mb: 4
              }}
            >
              <Typography variant="body1" color="textSecondary">
                Document preview not available in this demo
              </Typography>
            </Paper>
            
            <Typography variant="body1" paragraph>
              Please review the document carefully before proceeding to sign.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You will be asked to complete {signerFields.length} signature field(s).
            </Typography>
          </Box>
        );
      
      case 1:
        if (signerFields.length === 0) {
          return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="error">
                No signature fields assigned to you
              </Typography>
            </Box>
          );
        }
        
        const currentField = signerFields[currentFieldIndex];
        
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Field {currentFieldIndex + 1} of {signerFields.length}
            </Typography>
            
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3,
                borderRadius: 2,
                mb: 4,
                border: `2px solid ${theme.palette.primary.main}`
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                {currentField.type === 'signature' ? 'Signature' : 
                 currentField.type === 'initial' ? 'Initial' :
                 currentField.type === 'date' ? 'Date' :
                 currentField.type === 'text' ? 'Text' : 'Checkbox'}
              </Typography>
              
              {currentField.type === 'signature' && (
                <Box>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Type your name or draw your signature below:
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type your signature"
                    value={signatureValue}
                    onChange={(e) => setSignatureValue(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    By signing, you agree to the terms and conditions of this document.
                  </Typography>
                </Box>
              )}
              
              {currentField.type === 'text' && (
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter text"
                  value={signatureValue}
                  onChange={(e) => setSignatureValue(e.target.value)}
                />
              )}
              
              {currentField.type === 'date' && (
                <TextField
                  fullWidth
                  variant="outlined"
                  type="date"
                  value={signatureValue || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSignatureValue(e.target.value)}
                />
              )}
              
              {currentField.type === 'checkbox' && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={signatureValue === 'checked'}
                    onChange={(e) => setSignatureValue(e.target.checked ? 'checked' : '')}
                    style={{ width: 20, height: 20 }}
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    I agree
                  </Typography>
                </Box>
              )}
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="textSecondary">
                Field {currentFieldIndex + 1} of {signerFields.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {currentField.required ? 'Required' : 'Optional'}
              </Typography>
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Signing Complete!
            </Typography>
            <Typography variant="body1" paragraph>
              Thank you for signing this document.
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              A copy of the signed document will be emailed to you.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              Return to Home
            </Button>
          </Box>
        );
      
      default:
        return null;
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
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Document not found
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
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {currentDocument.name}
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {renderStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || activeStep === 2}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          {activeStep === 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSignField}
            >
              Sign
            </Button>
          ) : activeStep < 2 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          ) : null}
        </Box>
      </Paper>
    </Container>
  );
};

export default Sign;
