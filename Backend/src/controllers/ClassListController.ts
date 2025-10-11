import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import ClassListService from '@/services/ClassListService';
import {
  createClassListSchema,
  updateClassListSchema,
  addStudentsSchema,
  importExcelSchema,
  ExcelStudentData,
} from '@/types/classList.types';

/**
 * Controlador para Class Lists
 */
export class ClassListController {
  /**
   * POST /api/v1/lists
   * Crear una nueva lista de clase
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createClassListSchema.parse(req.body);
    const teacherId = req.userId!;

    const classList = await ClassListService.create(teacherId, validatedData);

    res.status(201).json({
      success: true,
      message: 'Class list created successfully',
      data: classList,
    });
  });

  /**
   * GET /api/v1/lists
   * Listar listas de clase del teacher
   */
  static list = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const userRole = req.userRole!;

    const filters: any = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      search: req.query.search as string,
    };

    // Teachers solo ven sus propias listas
    if (userRole === 'teacher') {
      filters.teacherId = userId;
    }

    // Admins pueden filtrar por teacher
    if (req.query.teacherId && userRole === 'admin') {
      filters.teacherId = parseInt(req.query.teacherId as string);
    }

    const result = await ClassListService.list(filters);

    res.status(200).json({
      success: true,
      data: result.classLists,
      pagination: result.pagination,
    });
  });

  /**
   * GET /api/v1/lists/:id
   * Obtener una lista específica con sus estudiantes
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const listId = parseInt(req.params.id);
    const userId = req.userId!;
    const userRole = req.userRole!;

    const classList = await ClassListService.getById(listId, userId, userRole);

    res.status(200).json({
      success: true,
      data: classList,
    });
  });

  /**
   * PUT /api/v1/lists/:id
   * Actualizar información de una lista
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    const listId = parseInt(req.params.id);
    const userId = req.userId!;
    const userRole = req.userRole!;
    const validatedData = updateClassListSchema.parse(req.body);

    const updated = await ClassListService.update(listId, userId, userRole, validatedData);

    res.status(200).json({
      success: true,
      message: 'Class list updated successfully',
      data: updated,
    });
  });

  /**
   * DELETE /api/v1/lists/:id
   * Eliminar una lista de clase
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const listId = parseInt(req.params.id);
    const userId = req.userId!;
    const userRole = req.userRole!;

    const result = await ClassListService.delete(listId, userId, userRole);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  /**
   * POST /api/v1/lists/:id/students
   * Agregar estudiantes a una lista
   */
  static addStudents = asyncHandler(async (req: Request, res: Response) => {
    const listId = parseInt(req.params.id);
    const userId = req.userId!;
    const userRole = req.userRole!;
    const validatedData = addStudentsSchema.parse(req.body);

    const result = await ClassListService.addStudents(listId, userId, userRole, validatedData);

    res.status(201).json({
      success: true,
      message: `${result.length} student(s) added to list`,
      data: result,
    });
  });

  /**
   * GET /api/v1/lists/:id/students
   * Obtener estudiantes de una lista
   */
  static getStudents = asyncHandler(async (req: Request, res: Response) => {
    const listId = parseInt(req.params.id);
    const userId = req.userId!;
    const userRole = req.userRole!;

    const students = await ClassListService.getStudents(listId, userId, userRole);

    res.status(200).json({
      success: true,
      data: students,
    });
  });

  /**
   * DELETE /api/v1/lists/:id/students/:userId
   * Remover un estudiante de una lista
   */
  static removeStudent = asyncHandler(async (req: Request, res: Response) => {
    const listId = parseInt(req.params.id);
    const studentId = parseInt(req.params.userId);
    const userId = req.userId!;
    const userRole = req.userRole!;

    const result = await ClassListService.removeStudent(listId, studentId, userId, userRole);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  /**
   * POST /api/v1/lists/import-excel
   * Importar estudiantes desde Excel
   */
  static importExcel = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.userId!;

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Excel file is required',
      });
      return;
    }

    // Parsear datos del body
    const bodyData = importExcelSchema.parse({
      list_name: req.body.list_name,
      grade_level: req.body.grade_level,
      auto_create_users: req.body.auto_create_users === 'true',
    });

    // Parsear el archivo Excel
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Validar y mapear datos
    const studentsData: ExcelStudentData[] = jsonData.map((row: any) => {
      // Buscar las columnas (case insensitive)
      const nombre = row['Nombre'] || row['nombre'] || row['NOMBRE'] || row['Name'] || row['name'];
      const apellido = row['Apellido'] || row['apellido'] || row['APELLIDO'] || row['Lastname'] || row['lastname'];
      const username = row['Username'] || row['username'] || row['Usuario'] || row['usuario'];
      const email = row['Email'] || row['email'] || row['Correo'] || row['correo'];
      const nickname = row['Nickname'] || row['nickname'] || row['Apodo'] || row['apodo'];

      if (!nombre || !apellido) {
        throw new Error('Excel debe contener columnas "Nombre" y "Apellido"');
      }

      return {
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        username: username ? String(username).trim() : undefined,
        email: email ? String(email).trim() : undefined,
        nickname: nickname ? String(nickname).trim() : undefined,
      };
    });

    if (studentsData.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid student data found in Excel file',
      });
      return;
    }

    const result = await ClassListService.importFromExcel(
      teacherId,
      bodyData.list_name,
      bodyData.grade_level,
      studentsData,
      bodyData.auto_create_users
    );

    res.status(201).json({
      success: true,
      message: 'Students imported successfully',
      data: result,
    });
  });
}

export default ClassListController;

