# Electronic Signature System - Local Development Guide

This document provides comprehensive instructions for setting up and running the Electronic Signature System locally. This application is built with React, TypeScript, and Material-UI, providing functionality similar to Signaturely.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [Application Structure](#application-structure)
5. [Features](#features)
6. [Development Notes](#development-notes)
7. [Troubleshooting](#troubleshooting)

## System Requirements

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

Follow these steps to set up the project locally:

1. **Extract the ZIP file** to your preferred location

2. **Navigate to the project directory**
   ```bash
   cd signature-app
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```
   This will install all required dependencies including:
   - React and React DOM
   - React Router for navigation
   - Material-UI components and icons
   - PDF-lib and React-PDF for PDF document handling
   - React Signature Canvas for signature drawing
   - UUID for generating unique identifiers

## Running the Application

After installation, you can run the application locally:

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. **Build for production** (optional)
   If you want to create a production build:
   ```bash
   npm run build
   ```
   The build files will be created in the `build` directory.

## Application Structure

The application follows a modular structure:

```
signature-app/
├── public/                 # Static files
├── src/                    # Source code
│   ├── assets/             # Images and other assets
│   ├── components/         # Reusable UI components
│   │   ├── document/       # Document-related components
│   │   ├── signature/      # Signature-related components
│   │   └── signing/        # Signing interface components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Application pages
│   │   ├── Auth/           # Authentication pages (bypassed)
│   │   ├── Dashboard/      # Document management dashboard
│   │   ├── Edit/           # Document editing and field placement
│   │   ├── Home/           # Landing page
│   │   ├── Sign/           # Signing interface
│   │   ├── Upload/         # Document upload
│   │   └── View/           # Document viewing
│   ├── services/           # Service modules
│   │   └── pdf/            # PDF handling services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   └── index.tsx           # Application entry point
└── package.json            # Project dependencies and scripts
```

## Features

The application includes the following key features:

### Document Upload
- Upload PDF documents
- Preview documents before processing
- Name and organize documents

### Signature Field Placement
- Add signature, text, date, and checkbox fields to documents
- Drag and drop fields to position them precisely
- Assign fields to specific signers

### Signer Management
- Add multiple signers with name and email
- Assign specific fields to specific signers
- Uploader can add themselves as a signer

### Signing Interface
- Draw signatures using a digital signature pad
- Fill in text fields and checkboxes
- View document while signing

### Document Management
- Dashboard for tracking document status
- View signed and pending documents
- Download completed documents

## Development Notes

### Authentication System
The authentication system has been bypassed to allow direct access to all features without login. A mock user is automatically provided through the AuthContext.

### Data Persistence
This is a frontend-only demonstration. Document data is stored in memory and will be lost on page refresh. In a production environment, you would connect this to a backend service with database storage.

### PDF Handling
The application uses pdf-lib for PDF manipulation and react-pdf for rendering. These libraries require proper setup and may have dependencies on system libraries.

## Troubleshooting

### Common Issues

1. **Node.js Version Conflicts**
   If you encounter errors during installation, ensure you're using a compatible Node.js version:
   ```bash
   node -v  # Should be v14.0.0 or higher
   ```

2. **PDF Rendering Issues**
   If PDFs don't render correctly:
   - Ensure you have the latest browser version
   - Try using Chrome if other browsers have issues
   - Check console for specific errors

3. **Build Errors**
   If you encounter build errors:
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

4. **Port Conflicts**
   If port 3000 is already in use, the development server will prompt you to use a different port.

### Getting Help
For additional help or to report issues, please contact the development team.
