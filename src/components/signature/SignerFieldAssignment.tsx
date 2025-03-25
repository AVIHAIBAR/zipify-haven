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
  Paper,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  useTheme
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import { Signer, SignatureField } from '../../types';

interface SignerFieldAssignmentProps {
  documentId: string;
  signers: Signer[];
  fields: SignatureField[];
  onUpdateField: (field: SignatureField) => Promise<SignatureField>;
}

const SignerFieldAssignment: React.FC<SignerFieldAssignmentProps> = ({
  documentId,
  signers,
  fields,
  onUpdateField
}) => {
  const theme = useTheme();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState<Signer | null>(null);
  const [error, setError] = useState('');
  
  // Group fields by signer
  const fieldsBySigner: Record<string, SignatureField[]> = {};
  
  // Initialize with empty arrays for each signer
  signers.forEach(signer => {
    fieldsBySigner[signer.id] = [];
  });
  
  // Add unassigned category
  fieldsBySigner['unassigned'] = [];
  
  // Populate fields by signer
  fields.forEach(field => {
    if (field.assignedTo && fieldsBySigner[field.assignedTo]) {
      fieldsBySigner[field.assignedTo].push(field);
    } else {
      fieldsBySigner['unassigned'].push(field);
    }
  });
  
  const handleOpenSignerFields = (signer: Signer) => {
    setSelectedSigner(signer);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSigner(null);
  };
  
  const handleAssignField = async (field: SignatureField, signerId: string) => {
    try {
      await onUpdateField({
        ...field,
        assignedTo: signerId
      });
      setError('');
    } catch (err) {
      console.error('Failed to assign field:', err);
      setError('Failed to assign field to signer');
    }
  };
  
  const getFieldTypeLabel = (type: string): string => {
    switch (type) {
      case 'signature': return 'Signature';
      case 'initial': return 'Initial';
      case 'date': return 'Date';
      case 'text': return 'Text';
      case 'checkbox': return 'Checkbox';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Field Assignments
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        {signers.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No signers added yet. Add signers to assign signature fields.
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {signers.map((signer, index) => {
              const signerFields = fieldsBySigner[signer.id] || [];
              
              return (
                <React.Fragment key={signer.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem
                    onClick={() => handleOpenSignerFields(signer)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={signer.name}
                      secondary={
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {signerFields.length > 0 ? (
                            signerFields.map(field => (
                              <Chip 
                                key={field.id} 
                                label={getFieldTypeLabel(field.type)} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No fields assigned
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleOpenSignerFields(signer)}>
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              );
            })}
            
            {/* Unassigned fields section */}
            {fieldsBySigner['unassigned'].length > 0 && (
              <>
                <Divider component="li" />
                <ListItem
                  sx={{ bgcolor: 'warning.light' }}
                >
                  <ListItemText
                    primary="Unassigned Fields"
                    secondary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {fieldsBySigner['unassigned'].map(field => (
                          <Chip 
                            key={field.id} 
                            label={getFieldTypeLabel(field.type)} 
                            size="small" 
                            color="warning" 
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    }
                  />
                </ListItem>
              </>
            )}
          </List>
        )}
      </Paper>
      
      {/* Signer Fields Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedSigner && (
          <>
            <DialogTitle>
              Fields for {selectedSigner.name}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" paragraph>
                Assign or unassign fields for this signer. Fields can be assigned to only one signer at a time.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Assigned Fields
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {fieldsBySigner[selectedSigner.id]?.length > 0 ? (
                    <List dense>
                      {fieldsBySigner[selectedSigner.id].map(field => (
                        <ListItem key={field.id}>
                          <ListItemText
                            primary={`${getFieldTypeLabel(field.type)} Field (Page ${field.page})`}
                            secondary={`Position: (${Math.round(field.x)}, ${Math.round(field.y)})`}
                          />
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleAssignField(field, '')}
                          >
                            Unassign
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center">
                      No fields assigned to this signer
                    </Typography>
                  )}
                </Paper>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Available Fields
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {fieldsBySigner['unassigned']?.length > 0 ? (
                    <List dense>
                      {fieldsBySigner['unassigned'].map(field => (
                        <ListItem key={field.id}>
                          <ListItemText
                            primary={`${getFieldTypeLabel(field.type)} Field (Page ${field.page})`}
                            secondary={`Position: (${Math.round(field.x)}, ${Math.round(field.y)})`}
                          />
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleAssignField(field, selectedSigner.id)}
                          >
                            Assign
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center">
                      No unassigned fields available
                    </Typography>
                  )}
                </Paper>
              </Box>
              
              {/* Other signers' fields */}
              {signers
                .filter(signer => signer.id !== selectedSigner.id)
                .map(signer => {
                  const otherSignerFields = fieldsBySigner[signer.id] || [];
                  if (otherSignerFields.length === 0) return null;
                  
                  return (
                    <Box key={signer.id} sx={{ mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Fields Assigned to {signer.name}
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <List dense>
                          {otherSignerFields.map(field => (
                            <ListItem key={field.id}>
                              <ListItemText
                                primary={`${getFieldTypeLabel(field.type)} Field (Page ${field.page})`}
                                secondary={`Position: (${Math.round(field.x)}, ${Math.round(field.y)})`}
                              />
                              <Button
                                size="small"
                                color="primary"
                                onClick={() => handleAssignField(field, selectedSigner.id)}
                              >
                                Reassign
                              </Button>
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Box>
                  );
                })}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SignerFieldAssignment;
