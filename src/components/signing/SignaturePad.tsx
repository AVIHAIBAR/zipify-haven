import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Divider,
  useTheme
} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onCancel: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel }) => {
  const theme = useTheme();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  
  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
    }
  };
  
  const handleSave = () => {
    if (sigCanvas.current && !isEmpty) {
      const dataUrl = sigCanvas.current.toDataURL('image/png');
      onSave(dataUrl);
    }
  };
  
  const handleBegin = () => {
    setIsEmpty(false);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, width: '100%', maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom align="center">
        Draw Your Signature
      </Typography>
      
      <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>
        Use your mouse or touch screen to sign below
      </Typography>
      
      <Box 
        sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: '#f9f9f9',
          mb: 2,
          height: 200,
          width: '100%'
        }}
      >
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: '100%',
            height: 200,
            className: 'signature-canvas'
          }}
          backgroundColor="rgba(0,0,0,0)"
          penColor={theme.palette.primary.main}
          onBegin={handleBegin}
        />
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<ClearIcon />}
          onClick={handleClear}
        >
          Clear
        </Button>
        
        <Box>
          <Button 
            variant="outlined" 
            onClick={onCancel}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<CheckIcon />}
            onClick={handleSave}
            disabled={isEmpty}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default SignaturePad;
