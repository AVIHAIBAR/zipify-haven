import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme
} from '@mui/material';
import SignatureIcon from '@mui/icons-material/Draw';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import { SignatureField } from '../../types';

interface SignatureFieldType {
  type: 'signature' | 'initial' | 'date' | 'text' | 'checkbox';
  icon: React.ReactNode;
  label: string;
}

interface SignatureFieldEditorProps {
  documentId: string;
  pageNumber: number;
  fields: SignatureField[];
  onAddField: (field: Omit<SignatureField, 'id'>) => void;
  onUpdateField: (field: SignatureField) => void;
  onDeleteField: (fieldId: string) => void;
  containerWidth: number;
  containerHeight: number;
  pdfScale: number;
}

const SignatureFieldEditor: React.FC<SignatureFieldEditorProps> = ({
  documentId,
  pageNumber,
  fields,
  onAddField,
  onUpdateField,
  onDeleteField,
  containerWidth,
  containerHeight,
  pdfScale
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFieldType, setSelectedFieldType] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<SignatureField | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
  
  const fieldTypes: SignatureFieldType[] = [
    { type: 'signature', icon: <SignatureIcon />, label: 'Signature' },
    { type: 'text', icon: <TextFieldsIcon />, label: 'Text' },
    { type: 'date', icon: <CalendarTodayIcon />, label: 'Date' },
    { type: 'checkbox', icon: <CheckBoxIcon />, label: 'Checkbox' }
  ];
  
  // Filter fields for current page
  const pageFields = fields.filter(field => field.page === pageNumber);
  
  const handleFieldTypeSelect = (type: string) => {
    setSelectedFieldType(type);
    setSelectedField(null);
  };
  
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedFieldType || !containerRef.current) return;
    
    // Get click position relative to container
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create new field
    const newField: Omit<SignatureField, 'id'> = {
      documentId,
      page: pageNumber,
      x: x / pdfScale,
      y: y / pdfScale,
      width: 150 / pdfScale,
      height: 50 / pdfScale,
      type: selectedFieldType as any,
      assignedTo: '',
      required: true,
      completed: false
    };
    
    onAddField(newField);
    setSelectedFieldType(null);
  };
  
  const handleFieldClick = (e: React.MouseEvent, field: SignatureField) => {
    e.stopPropagation();
    setSelectedField(field.id === selectedField?.id ? null : field);
  };
  
  const handleFieldRightClick = (e: React.MouseEvent, field: SignatureField) => {
    e.preventDefault();
    e.stopPropagation();
    
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setMenuAnchorEl(e.currentTarget as HTMLElement);
    setSelectedField(field);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuPosition(null);
  };
  
  const handleDeleteField = () => {
    if (selectedField) {
      onDeleteField(selectedField.id);
      setSelectedField(null);
    }
    handleMenuClose();
  };
  
  // Handle drag and drop for fields
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
  const handleFieldMouseDown = (e: React.MouseEvent, field: SignatureField) => {
    e.stopPropagation();
    
    if (e.button !== 0) return; // Only left mouse button
    
    setIsDragging(true);
    setSelectedField(field);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedField || !containerRef.current) return;
    
    const dx = (e.clientX - dragStartPos.x) / pdfScale;
    const dy = (e.clientY - dragStartPos.y) / pdfScale;
    
    const updatedField = {
      ...selectedField,
      x: selectedField.x + dx,
      y: selectedField.y + dy
    };
    
    onUpdateField(updatedField);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    // Add global mouse up handler
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Field type selector */}
      <Paper 
        elevation={2} 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          zIndex: 10,
          p: 1,
          display: 'flex',
          gap: 1,
          borderRadius: 2
        }}
      >
        {fieldTypes.map((fieldType) => (
          <Tooltip key={fieldType.type} title={fieldType.label}>
            <Button
              variant={selectedFieldType === fieldType.type ? 'contained' : 'outlined'}
              size="small"
              startIcon={fieldType.icon}
              onClick={() => handleFieldTypeSelect(fieldType.type)}
              sx={{ minWidth: 'auto' }}
            >
              {fieldType.label}
            </Button>
          </Tooltip>
        ))}
      </Paper>
      
      {/* Instructions */}
      {selectedFieldType && (
        <Paper 
          elevation={2} 
          sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            zIndex: 10,
            p: 1,
            borderRadius: 2,
            bgcolor: 'info.light',
            color: 'info.contrastText'
          }}
        >
          <Typography variant="body2">
            Click on the document to place a {selectedFieldType} field
          </Typography>
        </Paper>
      )}
      
      {/* Field container */}
      <Box 
        ref={containerRef}
        onClick={handleContainerClick}
        onMouseMove={handleMouseMove}
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          cursor: selectedFieldType ? 'crosshair' : 'default'
        }}
      >
        {/* Render fields */}
        {pageFields.map((field) => (
          <Box
            key={field.id}
            onClick={(e) => handleFieldClick(e, field)}
            onMouseDown={(e) => handleFieldMouseDown(e, field)}
            onContextMenu={(e) => handleFieldRightClick(e, field)}
            sx={{ 
              position: 'absolute', 
              left: field.x * pdfScale, 
              top: field.y * pdfScale, 
              width: field.width * pdfScale, 
              height: field.height * pdfScale,
              border: '2px solid',
              borderColor: selectedField?.id === field.id ? 'primary.main' : 'info.main',
              borderRadius: 1,
              bgcolor: 'rgba(0, 153, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'move',
              zIndex: selectedField?.id === field.id ? 2 : 1,
              '&:hover': {
                boxShadow: 2
              }
            }}
          >
            <Typography variant="caption" color="textSecondary">
              {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
            </Typography>
            
            {selectedField?.id === field.id && (
              <IconButton
                size="small"
                sx={{ 
                  position: 'absolute', 
                  top: -15, 
                  right: -15,
                  bgcolor: 'background.paper',
                  boxShadow: 1
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteField(field.id);
                  setSelectedField(null);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>
      
      {/* Context menu */}
      <Menu
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          menuPosition
            ? { top: menuPosition.y, left: menuPosition.x }
            : undefined
        }
      >
        <MenuItem onClick={handleDeleteField}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Field</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SignatureFieldEditor;
