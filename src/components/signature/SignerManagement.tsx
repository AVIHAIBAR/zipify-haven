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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
  Checkbox,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Signer } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SignerManagementProps {
  documentId: string;
  signers: Signer[];
  onAddSigner: (signer: Omit<Signer, 'id' | 'signUrl' | 'status'>) => Promise<Signer>;
  onDeleteSigner: (signerId: string) => Promise<void>;
  uploaderAsSigner: boolean;
  onToggleUploaderAsSigner: (enabled: boolean) => Promise<void>;
}

const SignerManagement: React.FC<SignerManagementProps> = ({
  documentId,
  signers,
  onAddSigner,
  onDeleteSigner,
  uploaderAsSigner,
  onToggleUploaderAsSigner
}) => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [newSigner, setNewSigner] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNewSigner({ name: '', email: '' });
    setError('');
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleAddSigner = async () => {
    if (!newSigner.name.trim() || !newSigner.email.trim()) {
      setError('Name and email are required');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSigner.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      await onAddSigner({
        name: newSigner.name,
        email: newSigner.email,
        documentId
      });
      
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to add signer:', err);
      setError('Failed to add signer');
    }
  };
  
  const handleDeleteSigner = async (signerId: string) => {
    try {
      await onDeleteSigner(signerId);
    } catch (err) {
      console.error('Failed to delete signer:', err);
      setError('Failed to delete signer');
    }
  };
  
  const handleToggleUploaderAsSigner = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await onToggleUploaderAsSigner(event.target.checked);
    } catch (err) {
      console.error('Failed to toggle uploader as signer:', err);
      setError('Failed to update signer settings');
    }
  };
  
  // Find if the current user (uploader) is already in the signers list
  const uploaderSigner = signers.find(signer => 
    currentUser && signer.email === currentUser.email
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Signers ({signers.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenDialog}
        >
          Add Signer
        </Button>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={uploaderAsSigner}
              onChange={handleToggleUploaderAsSigner}
              color="primary"
            />
          }
          label="I will also sign this document"
        />
        
        {uploaderAsSigner && !uploaderSigner && currentUser && (
          <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
            You will be added as a signer when the document is sent
          </Typography>
        )}
        
        {uploaderSigner && (
          <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
            You are already added as a signer
          </Typography>
        )}
      </Box>
      
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        {signers.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No signers added yet. Add signers to assign signature fields.
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {signers.map((signer, index) => (
              <React.Fragment key={signer.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleDeleteSigner(signer.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">
                          {signer.name}
                          {currentUser && signer.email === currentUser.email && " (You)"}
                        </Typography>
                      </Box>
                    }
                    secondary={signer.email}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Add Signer Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Signer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={newSigner.name}
            onChange={(e) => setNewSigner({ ...newSigner, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newSigner.email}
            onChange={(e) => setNewSigner({ ...newSigner, email: e.target.value })}
          />
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddSigner} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SignerManagement;
