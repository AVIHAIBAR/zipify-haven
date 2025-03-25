import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  useTheme
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Signer } from '../../types';

interface SignerSequenceProps {
  documentId: string;
  signers: Signer[];
  signingOrder: string[];
  onUpdateSigningOrder: (signingOrder: string[]) => Promise<void>;
  onToggleSequentialSigning: (enabled: boolean) => Promise<void>;
  sequentialSigningEnabled: boolean;
}

const SignerSequence: React.FC<SignerSequenceProps> = ({
  documentId,
  signers,
  signingOrder,
  onUpdateSigningOrder,
  onToggleSequentialSigning,
  sequentialSigningEnabled
}) => {
  const theme = useTheme();
  
  const [error, setError] = useState('');
  
  // Create a map of signer IDs to signer objects for easy lookup
  const signersMap = signers.reduce((map, signer) => {
    map[signer.id] = signer;
    return map;
  }, {} as Record<string, Signer>);
  
  // Get ordered signers based on signingOrder
  const orderedSigners = signingOrder
    .filter(id => signersMap[id]) // Filter out any IDs that don't exist in signersMap
    .map(id => signersMap[id]);
  
  // Get unordered signers (signers not in signingOrder)
  const unorderedSigners = signers.filter(signer => !signingOrder.includes(signer.id));
  
  const handleAddToOrder = (signerId: string) => {
    const newOrder = [...signingOrder, signerId];
    updateSigningOrder(newOrder);
  };
  
  const handleRemoveFromOrder = (signerId: string) => {
    const newOrder = signingOrder.filter(id => id !== signerId);
    updateSigningOrder(newOrder);
  };
  
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    
    const newOrder = [...signingOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    updateSigningOrder(newOrder);
  };
  
  const handleMoveDown = (index: number) => {
    if (index >= signingOrder.length - 1) return;
    
    const newOrder = [...signingOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    updateSigningOrder(newOrder);
  };
  
  const updateSigningOrder = async (newOrder: string[]) => {
    try {
      await onUpdateSigningOrder(newOrder);
      setError('');
    } catch (err) {
      console.error('Failed to update signing order:', err);
      setError('Failed to update signing order');
    }
  };
  
  const handleToggleSequential = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await onToggleSequentialSigning(event.target.checked);
      setError('');
    } catch (err) {
      console.error('Failed to toggle sequential signing:', err);
      setError('Failed to update signing settings');
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Signing Sequence
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Sequential Signing
          </Typography>
          <Switch
            checked={sequentialSigningEnabled}
            onChange={handleToggleSequential}
            color="primary"
          />
        </Box>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Paper elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
        <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
          <Typography variant="subtitle1">
            {sequentialSigningEnabled ? 'Sequential Signing Order' : 'Signers (Parallel Signing)'}
          </Typography>
        </Box>
        
        {orderedSigners.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              {sequentialSigningEnabled 
                ? 'No signing order defined. Add signers from below to create a sequence.'
                : 'All signers will receive the document simultaneously.'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {orderedSigners.map((signer, index) => (
              <ListItem
                key={signer.id}
                sx={{
                  bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                {sequentialSigningEnabled && (
                  <ListItemIcon>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <IconButton 
                        size="small" 
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                      >
                        <Box sx={{ transform: 'rotate(-90deg)' }}>
                          <DragIndicatorIcon fontSize="small" />
                        </Box>
                      </IconButton>
                      <IconButton 
                        size="small" 
                        disabled={index === orderedSigners.length - 1}
                        onClick={() => handleMoveDown(index)}
                      >
                        <Box sx={{ transform: 'rotate(90deg)' }}>
                          <DragIndicatorIcon fontSize="small" />
                        </Box>
                      </IconButton>
                    </Box>
                  </ListItemIcon>
                )}
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {sequentialSigningEnabled && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mr: 2, 
                            bgcolor: 'primary.main', 
                            color: 'primary.contrastText',
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {index + 1}
                        </Typography>
                      )}
                      <Typography variant="body1">{signer.name}</Typography>
                    </Box>
                  }
                  secondary={signer.email}
                />
                
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRemoveFromOrder(signer.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      
      {unorderedSigners.length > 0 && (
        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
            <Typography variant="subtitle1">
              Available Signers
            </Typography>
          </Box>
          
          <List sx={{ width: '100%' }}>
            {unorderedSigners.map((signer) => (
              <ListItem
                key={signer.id}
                sx={{
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ListItemText
                  primary={signer.name}
                  secondary={signer.email}
                />
                
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleAddToOrder(signer.id)}>
                    <AddIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      
      {sequentialSigningEnabled && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="textSecondary">
            With sequential signing enabled, signers will receive the document in the order specified above.
            Each signer will only receive the document after the previous signer has completed their signature.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SignerSequence;
