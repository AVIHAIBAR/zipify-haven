import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import { PDFDocument } from 'pdf-lib';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  acceptedFileTypes = ['.pdf', '.doc', '.docx'],
  maxFileSizeMB = 10
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const validateFile = async (file: File): Promise<boolean> => {
    setLoading(true);
    setError(null);

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxFileSizeMB) {
      setError(`File size exceeds the maximum limit of ${maxFileSizeMB}MB`);
      setLoading(false);
      return false;
    }

    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedFileTypes.includes(fileExtension)) {
      setError(`File type not supported. Please upload ${acceptedFileTypes.join(', ')} files`);
      setLoading(false);
      return false;
    }

    // For PDF files, validate the PDF structure
    if (fileExtension === '.pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        await PDFDocument.load(arrayBuffer);
      } catch (err) {
        console.error('PDF validation error:', err);
        setError('Invalid PDF file. The file might be corrupted or password protected.');
        setLoading(false);
        return false;
      }
    }

    setLoading(false);
    return true;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const isValid = await validateFile(file);
      
      if (isValid) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const isValid = await validateFile(file);
      
      if (isValid) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect, validateFile]);

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box
        sx={{
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          bgcolor: dragActive ? 'rgba(0, 153, 255, 0.05)' : 'background.paper',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(0, 153, 255, 0.05)'
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input
          type="file"
          id="file-upload-input"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {loading ? (
          <CircularProgress size={40} />
        ) : selectedFile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <DescriptionIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body1" fontWeight={500}>
              {selectedFile.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 2 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
            >
              Change File
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & Drop your file here
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              or click to browse files
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Supported formats: {acceptedFileTypes.join(', ')}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Maximum file size: {maxFileSizeMB}MB
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FileUploader;
