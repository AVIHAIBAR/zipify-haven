import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDocument } from '../../contexts/DocumentContext';
import { useAuth } from '../../contexts/AuthContext';
import { Document } from '../../types';

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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
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

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    documents, 
    getUserDocuments, 
    deleteDocument, 
    duplicateDocument 
  } = useDocument();
  
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const fetchDocuments = async () => {
      try {
        await getUserDocuments();
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [currentUser, getUserDocuments, navigate]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, document: Document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleViewDocument = () => {
    if (selectedDocument) {
      navigate(`/view/${selectedDocument.id}`);
    }
    handleMenuClose();
  };
  
  const handleEditDocument = () => {
    if (selectedDocument) {
      navigate(`/edit/${selectedDocument.id}`);
    }
    handleMenuClose();
  };
  
  const handleDuplicateDocument = async () => {
    if (selectedDocument) {
      try {
        await duplicateDocument(selectedDocument.id);
      } catch (err) {
        console.error('Failed to duplicate document:', err);
      }
    }
    handleMenuClose();
  };
  
  const handleDeleteDocument = async () => {
    if (selectedDocument) {
      try {
        await deleteDocument(selectedDocument.id);
      } catch (err) {
        console.error('Failed to delete document:', err);
      }
    }
    handleMenuClose();
  };
  
  const getFilteredDocuments = () => {
    switch (tabValue) {
      case 0: // All
        return documents;
      case 1: // Drafts
        return documents.filter(doc => doc.status === 'draft');
      case 2: // Pending
        return documents.filter(doc => doc.status === 'pending');
      case 3: // Completed
        return documents.filter(doc => doc.status === 'completed');
      default:
        return documents;
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
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Documents
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/upload')}
          >
            New Document
          </Button>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Manage your documents and track signature status.
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All" />
          <Tab label="Drafts" />
          <Tab label="Pending" />
          <Tab label="Completed" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Loading documents...</Typography>
            </Box>
          ) : getFilteredDocuments().length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                No documents found
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Get started by creating a new document.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/upload')}
              >
                New Document
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {getFilteredDocuments().map(document => (
                <Grid item xs={12} sm={6} md={4} key={document.id}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip 
                          label={getStatusLabel(document.status)} 
                          size="small"
                          sx={{ 
                            bgcolor: getStatusColor(document.status),
                            color: '#fff',
                            fontWeight: 500
                          }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, document)}
                          sx={{ ml: 1 }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="h6" component="h2" gutterBottom noWrap>
                        {document.name}
                      </Typography>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Created: {new Date(document.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/view/${document.id}`)}
                      >
                        View
                      </Button>
                      {document.status === 'draft' && (
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/edit/${document.id}`)}
                        >
                          Edit
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Loading documents...</Typography>
            </Box>
          ) : getFilteredDocuments().length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                No draft documents
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Get started by creating a new document.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/upload')}
              >
                New Document
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {getFilteredDocuments().map(document => (
                <Grid item xs={12} sm={6} md={4} key={document.id}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip 
                          label="Draft" 
                          size="small"
                          sx={{ 
                            bgcolor: theme.palette.info.main,
                            color: '#fff',
                            fontWeight: 500
                          }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, document)}
                          sx={{ ml: 1 }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="h6" component="h2" gutterBottom noWrap>
                        {document.name}
                      </Typography>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Created: {new Date(document.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/edit/${document.id}`)}
                      >
                        Edit
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Loading documents...</Typography>
            </Box>
          ) : getFilteredDocuments().length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                No pending documents
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Documents that are waiting for signatures will appear here.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {getFilteredDocuments().map(document => (
                <Grid item xs={12} sm={6} md={4} key={document.id}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip 
                          label="Awaiting Signatures" 
                          size="small"
                          sx={{ 
                            bgcolor: theme.palette.warning.main,
                            color: '#fff',
                            fontWeight: 500
                          }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, document)}
                          sx={{ ml: 1 }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="h6" component="h2" gutterBottom noWrap>
                        {document.name}
                      </Typography>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Created: {new Date(document.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/view/${document.id}`)}
                      >
                        View
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>Loading documents...</Typography>
            </Box>
          ) : getFilteredDocuments().length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                No completed documents
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Documents that have been signed by all parties will appear here.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {getFilteredDocuments().map(document => (
                <Grid item xs={12} sm={6} md={4} key={document.id}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Chip 
                          label="Completed" 
                          size="small"
                          sx={{ 
                            bgcolor: theme.palette.success.main,
                            color: '#fff',
                            fontWeight: 500
                          }}
                        />
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleMenuOpen(e, document)}
                          sx={{ ml: 1 }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="h6" component="h2" gutterBottom noWrap>
                        {document.name}
                      </Typography>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Created: {new Date(document.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/view/${document.id}`)}
                      >
                        View
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDocument}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        {selectedDocument && selectedDocument.status === 'draft' && (
          <MenuItem onClick={handleEditDocument}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDuplicateDocument}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteDocument}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Dashboard;
