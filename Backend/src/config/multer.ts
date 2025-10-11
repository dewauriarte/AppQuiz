import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { BadRequestError } from '@/utils/ApiError';

/**
 * Configuración de Multer para upload de archivos
 */

// Almacenar en memoria (Buffer) para procesar directamente
const storage = multer.memoryStorage();

// Filtro de archivos - solo PDFs
const pdfFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // Validar tipo MIME
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only PDF files are allowed'));
  }
};

// Filtro de archivos - solo Excel
const excelFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // Validar tipo MIME para archivos Excel
  const allowedMimeTypes = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.oasis.opendocument.spreadsheet', // .ods
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only Excel files are allowed (.xlsx, .xls)'));
  }
};

// Configuración para PDFs
export const uploadPDF = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB máximo
    files: 1,
  },
}).single('pdf');

// Configuración para Excel
export const uploadExcel = multer({
  storage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB máximo
    files: 1,
  },
}).single('file');

