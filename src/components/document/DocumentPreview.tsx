import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { Document, Page } from 'react-pdf';
import PDFService from '../../services/pdf/PDFService';

interface DocumentPreviewProps {
  file: File | null;
  onDocumentLoad?: (numPages: number) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file, onDocumentLoad }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return;
    }

    const loadFile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Convert file to data URL for preview
        const dataUrl = await PDFService.fileToDataURL(file);
        setFileUrl(dataUrl);
        
        // Get page count
        const pageCount = await PDFService.getPageCount(file);
        setNumPages(pageCount);
        if (onDocumentLoad) {
          onDocumentLoad(pageCount);
        }
      } catch (err) {
        console.error('Error loading document:', err);
        setError('Failed to load document. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadFile();

    // Cleanup
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [file, onDocumentLoad]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!file || !fileUrl) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 400,
          bgcolor: '#f5f5f5',
          borderRadius: 2
        }}
      >
        <Typography variant="body1" color="textSecondary">
          No document selected
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
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
        <Typography variant="body1">
          {file.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {numPages} page{numPages !== 1 ? 's' : ''}
        </Typography>
      </Paper>

      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#f5f5f5',
          minHeight: 500
        }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            if (onDocumentLoad) {
              onDocumentLoad(numPages);
            }
          }}
          onLoadError={(error) => {
            console.error('Error loading PDF:', error);
            setError('Failed to load PDF. The file might be corrupted.');
          }}
          loading={
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress />
            </Box>
          }
        >
          <Page 
            pageNumber={currentPage} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={600}
          />
        </Document>
      </Box>

      {numPages && numPages > 1 && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mt: 2
          }}
        >
          <Typography variant="body2">
            Page {currentPage} of {numPages}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DocumentPreview;
