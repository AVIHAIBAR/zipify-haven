import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
    }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ py: 8 }}>
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              Simple, and Legally-Binding Electronic Signatures
            </Typography>
            <Typography variant="h5" color="textSecondary" paragraph sx={{ mb: 4 }}>
              Upload a document now — get it legally signed blazing fast
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                size="large" 
                color="primary"
                onClick={() => navigate('/upload')}
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  fontSize: '1.1rem'
                }}
              >
                Upload Document
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%'
            }}>
              <Paper elevation={4} sx={{ 
                p: 2, 
                borderRadius: 2,
                width: '100%',
                maxWidth: 500,
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff'
              }}>
                <Typography variant="h6" color="textSecondary">
                  Document Preview Placeholder
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Features that actually save you time and clicks
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              { title: 'Seamless collaboration', description: 'Sign your own documents and send them to one or multiple signers. Always get your paperwork signed on time, by all parties.' },
              { title: 'Time-saving templates', description: 'Create templates for your documents once and use them again and again. Share templates with others in your team for extra hours saved.' },
              { title: 'Legal validation', description: 'Signatures, initials, dates, textboxes and checkboxes. Any data collected via our platform is legally binding.' },
              { title: 'Automatic reminders', description: 'Set it and forget it. When someone needs to sign a document, they\'ll get an automatic reminder.' },
              { title: 'Easy access & management', description: 'Access your documents anytime, anywhere. Manage your documents with ease.' },
              { title: 'Paperless', description: 'Save trees and contribute to your company\'s green goals.' }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                  <Typography variant="h5" component="h3" gutterBottom color="primary">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
