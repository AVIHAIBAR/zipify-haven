import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDocument } from '../../contexts/DocumentContext';
import FileUploader from '../../components/document/FileUploader';
import DocumentPreview from '../../components/document/DocumentPreview';

const DocumentUpload: React.FC = () => {
  const navigate = useNavigate();
  const { createDocument, loading } = useDocument();
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState('');
  
  const steps = ['Select Document', 'Review Document', 'Finalize'];
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Use file name without extension as default document name
    setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
    setError('');
  };
  
  const handleNext = () => {
    if (activeStep === 0 && !selectedFile) {
      setError('Please select a file to continue');
      return;
    }
    
    if (activeStep === 1 && !documentName.trim()) {
      setError('Please enter a document name');
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !documentName.trim()) {
      setError('Missing required information');
      return;
    }
    
    try {
      const document = await createDocument(documentName, selectedFile);
      navigate(`/edit/${document.id}`);
    } catch (err) {
      console.error('Failed to upload document:', err);
      setError('Failed to upload document. Please try again.');
    }
  };
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Select a Document to Upload
            </Typography>
            <FileUploader onFileSelect={handleFileSelect} />
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Review Document
            </Typography>
            
            <TextField
              fullWidth
              label="Document Name"
              variant="outlined"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              sx={{ mb: 4 }}
            />
            
            <DocumentPreview 
              file={selectedFile} 
              onDocumentLoad={(pages) => setNumPages(pages)}
            />
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Finalize Upload
            </Typography>
            
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" fontWeight={500}>Document Name:</Typography>
                <Typography variant="body1">{documentName}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" fontWeight={500}>File Name:</Typography>
                <Typography variant="body1">{selectedFile?.name}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" fontWeight={500}>File Size:</Typography>
                <Typography variant="body1">
                  {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight={500}>Pages:</Typography>
                <Typography variant="body1">{numPages}</Typography>
              </Box>
            </Paper>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 4 }}>
              Click "Upload" to proceed to the document editor where you can add signature fields.
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Upload Document
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
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          renderStepContent(activeStep)
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
            >
              Upload
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default DocumentUpload;
