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
  Grid,
  TextField,
  IconButton,
  Divider,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDocument } from '../../contexts/DocumentContext';

const Upload: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { createDocument } = useDocument();
  
  const [activeStep, setActiveStep] = useState(0);
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  
  const steps = ['Select Document', 'Review Details', 'Upload'];
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // Check if file is PDF or Word document
      if (file.type === 'application/pdf' || 
          file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedFile(file);
        if (!documentName) {
          // Use file name without extension as default document name
          setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
        }
        setError('');
      } else {
        setError('Please select a PDF or Word document');
        setSelectedFile(null);
      }
    }
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
    
    if (activeStep === steps.length - 1) {
      handleUpload();
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
      setError('Failed to upload document. Please try again.');
      console.error(err);
    }
  };
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                size="large"
                sx={{ 
                  py: 2, 
                  px: 4, 
                  borderStyle: 'dashed', 
                  borderWidth: 2,
                  borderRadius: 2
                }}
              >
                Select File
              </Button>
            </label>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Supported formats: PDF, DOC, DOCX
            </Typography>
            
            {selectedFile && (
              <Paper 
                elevation={1} 
                sx={{ 
                  mt: 4, 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="body1">{selectedFile.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setSelectedFile(null)}>
                  <DeleteIcon />
                </IconButton>
              </Paper>
            )}
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ py: 4 }}>
            <TextField
              fullWidth
              label="Document Name"
              variant="outlined"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              sx={{ mb: 4 }}
            />
            
            <Typography variant="h6" gutterBottom>
              Document Preview
            </Typography>
            <Paper 
              elevation={2} 
              sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 2
              }}
            >
              <Typography variant="body1" color="textSecondary">
                Preview not available in this demo
              </Typography>
            </Paper>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Document Name
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {documentName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    File Name
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {selectedFile?.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    File Size
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                  </Typography>
                </Grid>
              </Grid>
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
        
        {renderStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
          >
            {activeStep === steps.length - 1 ? 'Upload' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Upload;
