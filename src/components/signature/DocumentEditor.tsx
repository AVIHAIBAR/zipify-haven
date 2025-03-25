import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Divider,
  useTheme
} from '@mui/material';
import { Document, Page } from 'react-pdf';
import { SignatureField, Signer } from '../../types';
import SignatureFieldEditor from './SignatureFieldEditor';

interface DocumentEditorProps {
  documentId: string;
  documentUrl: string;
  fields: SignatureField[];
  signers: Signer[];
  onAddField: (field: Omit<SignatureField, 'id'>) => Promise<SignatureField>;
  onUpdateField: (field: SignatureField) => Promise<SignatureField>;
  onDeleteField: (fieldId: string) => Promise<void>;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  documentId,
  documentUrl,
  fields,
  signers,
  onAddField,
  onUpdateField,
  onDeleteField
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [selectedSigner, setSelectedSigner] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };
  
  const handlePageChange = (newPage: number) => {
    if (numPages && newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleSignerChange = (event: SelectChangeEvent) => {
    setSelectedSigner(event.target.value);
  };
  
  const handleAddField = async (field: Omit<SignatureField, 'id'>) => {
    try {
      // Add selected signer to the field
      const fieldWithSigner = {
        ...field,
        assignedTo: selectedSigner || (signers.length > 0 ? signers[0].id : '')
      };
      
      await onAddField(fieldWithSigner);
    } catch (err) {
      console.error('Failed to add field:', err);
      setError('Failed to add signature field');
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {numPages && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                variant="outlined"
                size="small"
              >
                Previous
              </Button>
              <Typography variant="body2" sx={{ mx: 2 }}>
                Page {currentPage} of {numPages}
              </Typography>
              <Button
                disabled={currentPage === numPages}
                onClick={() => handlePageChange(currentPage + 1)}
                variant="outlined"
                size="small"
              >
                Next
              </Button>
            </Box>
          )}
          
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              onClick={() => setScale(scale => Math.max(0.5, scale - 0.1))}
              variant="outlined"
              size="small"
            >
              -
            </Button>
            <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
              {Math.round(scale * 100)}%
            </Typography>
            <Button
              onClick={() => setScale(scale => Math.min(2, scale + 0.1))}
              variant="outlined"
              size="small"
            >
              +
            </Button>
          </Box>
        </Box>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="signer-select-label">Assign Fields To</InputLabel>
          <Select
            labelId="signer-select-label"
            value={selectedSigner}
            label="Assign Fields To"
            onChange={handleSignerChange}
            size="small"
          >
            {signers.length === 0 ? (
              <MenuItem disabled>No signers added</MenuItem>
            ) : (
              signers.map((signer) => (
                <MenuItem key={signer.id} value={signer.id}>
                  {signer.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Paper>
      
      {/* Document viewer with field editor */}
      <Box 
        ref={containerRef}
        sx={{ 
          flex: 1, 
          position: 'relative', 
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: '#f5f5f5'
        }}
      >
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10
          }}>
            <Typography variant="body1">Loading document...</Typography>
          </Box>
        )}
        
        {error && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10
          }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          p: 4,
          minHeight: '100%'
        }}>
          <Box sx={{ position: 'relative' }}>
            <Document
              file={documentUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error('Error loading PDF:', error);
                setError('Failed to load document');
                setLoading(false);
              }}
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={containerDimensions.width * 0.8}
              />
            </Document>
            
            {!loading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%'
              }}>
                <SignatureFieldEditor
                  documentId={documentId}
                  pageNumber={currentPage}
                  fields={fields}
                  onAddField={handleAddField}
                  onUpdateField={onUpdateField}
                  onDeleteField={onDeleteField}
                  containerWidth={containerDimensions.width * 0.8}
                  containerHeight={containerDimensions.height}
                  pdfScale={scale}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentEditor;
