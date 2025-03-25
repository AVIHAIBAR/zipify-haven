import React from 'react';
import { PDFDocument } from 'pdf-lib';

// Service for handling PDF document operations
class PDFService {
  // Load a PDF file and return the PDFDocument object
  static async loadPDF(file: File): Promise<ArrayBuffer> {
    try {
      return await file.arrayBuffer();
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('Failed to load PDF file');
    }
  }

  // Create a PDFDocument from an ArrayBuffer
  static async createPDFDocument(arrayBuffer: ArrayBuffer): Promise<PDFDocument> {
    try {
      return await PDFDocument.load(arrayBuffer);
    } catch (error) {
      console.error('Error creating PDF document:', error);
      throw new Error('Failed to create PDF document');
    }
  }

  // Get the number of pages in a PDF document
  static async getPageCount(file: File): Promise<number> {
    try {
      const arrayBuffer = await this.loadPDF(file);
      const pdfDoc = await this.createPDFDocument(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch (error) {
      console.error('Error getting page count:', error);
      throw new Error('Failed to get page count');
    }
  }

  // Save a PDFDocument to a Blob
  static async saveToBlob(pdfDoc: PDFDocument): Promise<Blob> {
    try {
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error saving PDF to blob:', error);
      throw new Error('Failed to save PDF');
    }
  }

  // Convert a File to a data URL for preview
  static async fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Validate if a file is a valid PDF
  static async validatePDF(file: File): Promise<boolean> {
    try {
      const arrayBuffer = await this.loadPDF(file);
      await this.createPDFDocument(arrayBuffer);
      return true;
    } catch (error) {
      console.error('PDF validation error:', error);
      return false;
    }
  }
}

export default PDFService;
