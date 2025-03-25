import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import { useDocument } from '../../contexts/DocumentContext';
import { Document, Signer } from '../../types';

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

const DocumentView: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { 
    currentDocument, 
    signers, 
    getDocument, 
    downloadDocument, 
    resendInvitation 
  } = useDocument();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!documentId) {
      navigate('/dashboard');
      return;
    }
    
    const fetchDocument = async () => {
      try {
        await getDocument(documentId);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch document:', err);
        setLoading(false);
        navigate('/dashboard');
      }
    };
    
    fetchDocument();
  }, [documentId, getDocument, navigate]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleDownload = async () => {
    if (currentDocument) {
      try {
        await downloadDocument(currentDocument.id);
      } catch (err) {
        console.error('Failed to download document:', err);
      }
    }
  };
  
  const handleResendInvitation = async (signerId: string) => {
    if (currentDocument) {
      try {
        await resendInvitation(currentDocument.id, signerId);
      } catch (err) {
        console.error('Failed to resend invitation:', err);
      }
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return theme.palette.info.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'completed':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'Awaiting Signatures';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };
  
  if (loading || !currentDocument) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading document...</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {currentDocument.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip 
                label={getStatusLabel(currentDocument.status)} 
                size="small"
                sx={{ 
                  bgcolor: getStatusColor(currentDocument.status),
                  color: '#fff',
                  fontWeight: 500,
                  mr: 2
                }}
              />
              <Typography variant="body2" color="textSecondary">
                Created: {new Date(currentDocument.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ borderRadius: 2, mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Document" />
              <Tab label="Activity" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 2 }}>
                <iframe
                  src={currentDocument.fileUrl}
                  style={{ width: '100%', height: '600px', border: 'none' }}
                  title={currentDocument.name}
                />
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Document created</TableCell>
                      <TableCell>{new Date(currentDocument.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                    {currentDocument.status !== 'draft' && (
                      <TableRow>
                        <TableCell>Document sent for signing</TableCell>
                        <TableCell>{new Date(currentDocument.updatedAt).toLocaleString()}</TableCell>
                      </TableRow>
                    )}
                    {signers.map(signer => (
                      signer.status === 'completed' && (
                        <TableRow key={signer.id}>
                          <TableCell>{`${signer.name} signed the document`}</TableCell>
                          <TableCell>{signer.completedAt ? new Date(signer.completedAt).toLocaleString() : 'N/A'}</TableCell>
                        </TableRow>
                      )
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ borderRadius: 2, p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Created
              </Typography>
              <Typography variant="body1">
                {new Date(currentDocument.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="body1">
                {new Date(currentDocument.updatedAt).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                File Type
              </Typography>
              <Typography variant="body1">
                {currentDocument.fileType}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                File Size
              </Typography>
              <Typography variant="body1">
                {(currentDocument.fileSize / (1024 * 1024)).toFixed(2)} MB
              </Typography>
            </Box>
          </Paper>
          
          <Paper elevation={3} sx={{ borderRadius: 2, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Signers
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {signers.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No signers added yet.
              </Typography>
            ) : (
              signers.map(signer => (
                <Card 
                  key={signer.id} 
                  variant="outlined" 
                  sx={{ mb: 2, borderColor: signer.status === 'completed' ? theme.palette.success.main : theme.palette.divider }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {signer.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {signer.email}
                        </Typography>
                      </Box>
                      <Box>
                        {signer.status === 'completed' ? (
                          <Chip 
                            label="Completed" 
                            size="small"
                            sx={{ 
                              bgcolor: theme.palette.success.main,
                              color: '#fff',
                              fontWeight: 500
                            }}
                          />
                        ) : (
                          <>
                            <Chip 
                              label="Pending" 
                              size="small"
                              sx={{ 
                                bgcolor: theme.palette.warning.main,
                                color: '#fff',
                                fontWeight: 500,
                                mr: 1
                              }}
                            />
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleResendInvitation(signer.id)}
                              title="Resend invitation"
                            >
                              <EmailIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DocumentView;
