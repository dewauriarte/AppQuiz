import { z } from 'zod';

/**
 * Schema para crear una lista de clase
 */
export const createClassListSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  grade_level: z.string().optional(),
});

/**
 * Schema para actualizar una lista de clase
 */
export const updateClassListSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  grade_level: z.string().optional(),
});

/**
 * Schema para agregar estudiantes a una lista
 */
export const addStudentsSchema = z.object({
  students: z.array(
    z.object({
      user_id: z.number().int().positive(),
      nickname: z.string().max(50).optional(),
    })
  ).min(1, 'Debe agregar al menos un estudiante'),
});

/**
 * Schema para importar desde Excel
 */
export const importExcelSchema = z.object({
  list_name: z.string().min(3).max(100),
  grade_level: z.string().optional(),
  auto_create_users: z.boolean().default(true),
});

/**
 * Tipos inferidos
 */
export type CreateClassListInput = z.infer<typeof createClassListSchema>;
export type UpdateClassListInput = z.infer<typeof updateClassListSchema>;
export type AddStudentsInput = z.infer<typeof addStudentsSchema>;
export type ImportExcelInput = z.infer<typeof importExcelSchema>;

/**
 * Interfaz para datos de estudiante desde Excel
 */
export interface ExcelStudentData {
  nombre: string;
  apellido: string;
  username?: string;
  email?: string;
  nickname?: string;
}

/**
 * Filtros para listar listas de clase
 */
export interface ClassListFilters {
  teacherId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

