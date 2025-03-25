import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  Checkbox,
  FormControlLabel,
  Paper,
  useTheme
} from '@mui/material';
import { SignatureField } from '../../types';
import SignaturePad from './SignaturePad';

interface FieldInputProps {
  field: SignatureField;
  onComplete: (fieldId: string, value: string) => Promise<void>;
}

const FieldInput: React.FC<FieldInputProps> = ({ field, onComplete }) => {
  const theme = useTheme();
  
  const [value, setValue] = useState<string>('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [error, setError] = useState('');
  
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setError('');
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.checked ? 'true' : 'false');
    setError('');
  };
  
  const handleComplete = async () => {
    if (field.type !== 'checkbox' && !value.trim()) {
      setError('This field is required');
      return;
    }
    
    try {
      await onComplete(field.id, value);
    } catch (err) {
      console.error('Failed to complete field:', err);
      setError('Failed to save field value');
    }
  };
  
  const handleSignatureComplete = async (signatureDataUrl: string) => {
    setValue(signatureDataUrl);
    setShowSignaturePad(false);
    
    try {
      await onComplete(field.id, signatureDataUrl);
    } catch (err) {
      console.error('Failed to save signature:', err);
      setError('Failed to save signature');
    }
  };
  
  const renderFieldInput = () => {
    switch (field.type) {
      case 'signature':
        return (
          <Box>
            {showSignaturePad ? (
              <SignaturePad 
                onSave={handleSignatureComplete}
                onCancel={() => setShowSignaturePad(false)}
              />
            ) : (
              <Box>
                {value ? (
                  <Box sx={{ mb: 2 }}>
                    <img 
                      src={value} 
                      alt="Signature" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: 100,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius,
                        padding: theme.spacing(1)
                      }} 
                    />
                  </Box>
                ) : null}
                
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => setShowSignaturePad(true)}
                >
                  {value ? 'Change Signature' : 'Draw Signature'}
                </Button>
              </Box>
            )}
          </Box>
        );
      
      case 'text':
        return (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter text"
            value={value}
            onChange={handleValueChange}
            error={!!error}
            helperText={error}
          />
        );
      
      case 'date':
        return (
          <TextField
            fullWidth
            variant="outlined"
            type="date"
            value={value}
            onChange={handleValueChange}
            error={!!error}
            helperText={error}
          />
        );
      
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={value === 'true'}
                onChange={handleCheckboxChange}
              />
            }
            label="I agree"
          />
        );
      
      default:
        return (
          <Typography color="error">
            Unknown field type: {field.type}
          </Typography>
        );
    }
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        {field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field
      </Typography>
      
      {renderFieldInput()}
      
      {field.type !== 'signature' && field.type !== 'checkbox' && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleComplete}
          >
            Save
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FieldInput;
