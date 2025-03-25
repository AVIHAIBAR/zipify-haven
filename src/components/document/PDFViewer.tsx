import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, CircularProgress, Typography } from '@mui/material';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  file: string | File | null;
  onLoadSuccess?: (pdf: any) => void;
  width?: number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, onLoadSuccess, width = 600 }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    if (onLoadSuccess) {
      onLoadSuccess({ numPages });
    }
  }, [onLoadSuccess]);

  const handleLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please check if the file is valid.');
    setLoading(false);
  }, []);

  if (!file) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100%',
        bgcolor: '#f5f5f5',
        borderRadius: 1
      }}>
        <Typography variant="body1" color="textSecondary">
          No document selected
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center'
    }}>
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 200,
          width: '100%'
        }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 200,
          width: '100%'
        }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      <Document
        file={file}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        loading={
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: 200,
            width: '100%'
          }}>
            <CircularProgress />
          </Box>
        }
      >
        {numPages && Array.from(new Array(numPages), (_, index) => (
          <Box key={`page_${index + 1}`} sx={{ mb: 2, boxShadow: 1, borderRadius: 1 }}>
            <Page 
              pageNumber={index + 1} 
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Box>
        ))}
      </Document>
      
      {numPages && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {numPages} page{numPages > 1 ? 's' : ''}
        </Typography>
      )}
    </Box>
  );
};

export default PDFViewer;
