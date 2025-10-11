import prisma from '@/config/database';
import {
  CreateClassListInput,
  UpdateClassListInput,
  AddStudentsInput,
  ClassListFilters,
  ExcelStudentData,
} from '@/types/classList.types';
import { NotFoundError, ForbiddenError, BadRequestError } from '@/utils/ApiError';
import bcrypt from 'bcryptjs';

/**
 * Servicio para gestión de listas de clase (Class Lists)
 */
export class ClassListService {
  /**
   * Crear una nueva lista de clase
   */
  async create(teacherId: number, data: CreateClassListInput) {
    try {
      const classList = await prisma.class_lists.create({
        data: {
          teacher_id: teacherId,
          name: data.name,
          grade_level: data.grade_level,
        },
        include: {
          teacher: {
            select: {
              user_id: true,
              username: true,
              display_name: true,
            },
          },
          _count: {
            select: {
              class_list_students: true,
            },
          },
        },
      });

      return classList;
    } catch (error) {
      console.error('Error creating class list:', error);
      throw new BadRequestError(`Failed to create class list: ${error}`);
    }
  }

  /**
   * Listar listas de clase del teacher
   */
  async list(filters: ClassListFilters) {
    const { teacherId, search, page = 1, limit = 20 } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (teacherId) where.teacher_id = teacherId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { grade_level: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [classLists, total] = await Promise.all([
      prisma.class_lists.findMany({
        where,
        include: {
          teacher: {
            select: {
              user_id: true,
              username: true,
              display_name: true,
            },
          },
          _count: {
            select: {
              class_list_students: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.class_lists.count({ where }),
    ]);

    return {
      classLists,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener una lista por ID
   */
  async getById(listId: number, userId: number, userRole: string) {
    const classList = await prisma.class_lists.findUnique({
      where: { list_id: listId },
      include: {
        teacher: {
          select: {
            user_id: true,
            username: true,
            display_name: true,
          },
        },
        class_list_students: {
          include: {
            student: {
              select: {
                user_id: true,
                username: true,
                display_name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!classList) {
      throw new NotFoundError('Class list not found');
    }

    // Verificar acceso
    if (classList.teacher_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You do not have access to this class list');
    }

    return classList;
  }

  /**
   * Actualizar una lista
   */
  async update(
    listId: number,
    userId: number,
    userRole: string,
    data: UpdateClassListInput
  ) {
    const classList = await prisma.class_lists.findUnique({
      where: { list_id: listId },
    });

    if (!classList) {
      throw new NotFoundError('Class list not found');
    }

    // Verificar permisos
    if (classList.teacher_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You do not have permission to update this class list');
    }

    const updated = await prisma.class_lists.update({
      where: { list_id: listId },
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: {
        teacher: {
          select: {
            user_id: true,
            username: true,
            display_name: true,
          },
        },
        _count: {
          select: {
            class_list_students: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Eliminar una lista (y sus estudiantes)
   */
  async delete(listId: number, userId: number, userRole: string) {
    const classList = await prisma.class_lists.findUnique({
      where: { list_id: listId },
    });

    if (!classList) {
      throw new NotFoundError('Class list not found');
    }

    // Verificar permisos
    if (classList.teacher_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You do not have permission to delete this class list');
    }

    // Cascade delete manejado por Prisma
    await prisma.class_lists.delete({
      where: { list_id: listId },
    });

    return { message: 'Class list deleted successfully' };
  }

  /**
   * Agregar estudiantes a una lista
   */
  async addStudents(
    listId: number,
    userId: number,
    userRole: string,
    data: AddStudentsInput
  ) {
    const classList = await prisma.class_lists.findUnique({
      where: { list_id: listId },
    });

    if (!classList) {
      throw new NotFoundError('Class list not found');
    }

    // Verificar permisos
    if (classList.teacher_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You do not have permission to add students to this list');
    }

    // Verificar que los estudiantes existan y sean estudiantes
    const studentIds = data.students.map((s) => s.user_id);
    const users = await prisma.users.findMany({
      where: {
        user_id: { in: studentIds },
        role: 'student',
        is_active: true,
      },
      select: {
        user_id: true,
        username: true,
        display_name: true,
      },
    });

    if (users.length !== studentIds.length) {
      throw new BadRequestError('Some users do not exist or are not active students');
    }

    // Crear registros (ignorar duplicados)
    const studentsToAdd = data.students.map((s) => ({
      list_id: listId,
      user_id: s.user_id,
      nickname: s.nickname,
    }));

    const result = await prisma.$transaction(async (tx) => {
      const added = [];
      for (const student of studentsToAdd) {
        try {
          const created = await tx.class_list_students.create({
            data: student,
            include: {
              student: {
                select: {
                  user_id: true,
                  username: true,
                  display_name: true,
                },
              },
            },
          });
          added.push(created);
        } catch (error: any) {
          // Ignorar si ya existe (violación de unique constraint)
          if (error.code === 'P2002') {
            continue;
          }
          throw error;
        }
      }
      return added;
    });

    return result;
  }

  /**
   * Obtener estudiantes de una lista
   */
  async getStudents(listId: number, userId: number, userRole: string) {
    const classList = await prisma.class_lists.findUnique({
      where: { list_id: listId },
    });

    if (!classList) {
      throw new NotFoundError('Class list not found');
    }

    // Verificar acceso
    if (classList.teacher_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You do not have access to this class list');
    }

    const students = await prisma.class_list_students.findMany({
      where: { list_id: listId },
      include: {
        student: {
          select: {
            user_id: true,
            username: true,
            display_name: true,
            email: true,
            created_at: true,
          },
        },
      },
      orderBy: {
        added_at: 'asc',
      },
    });

    return students;
  }

  /**
   * Remover un estudiante de una lista
   */
  async removeStudent(
    listId: number,
    studentId: number,
    userId: number,
    userRole: string
  ) {
    const classList = await prisma.class_lists.findUnique({
      where: { list_id: listId },
    });

    if (!classList) {
      throw new NotFoundError('Class list not found');
    }

    // Verificar permisos
    if (classList.teacher_id !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You do not have permission to remove students from this list');
    }

    // Verificar que el estudiante esté en la lista
    const exists = await prisma.class_list_students.findUnique({
      where: {
        list_id_user_id: {
          list_id: listId,
          user_id: studentId,
        },
      },
    });

    if (!exists) {
      throw new NotFoundError('Student not found in this list');
    }

    await prisma.class_list_students.delete({
      where: {
        list_id_user_id: {
          list_id: listId,
          user_id: studentId,
        },
      },
    });

    return { message: 'Student removed from list successfully' };
  }

  /**
   * Importar estudiantes desde datos de Excel
   */
  async importFromExcel(
    teacherId: number,
    listName: string,
    gradeLevel: string | undefined,
    studentsData: ExcelStudentData[],
    autoCreateUsers: boolean = true
  ) {
    if (studentsData.length === 0) {
      throw new BadRequestError('No students data provided');
    }

    // Crear la lista primero
    const classList = await prisma.class_lists.create({
      data: {
        teacher_id: teacherId,
        name: listName,
        grade_level: gradeLevel,
      },
    });

    const result = await prisma.$transaction(async (tx) => {
      const created: any[] = [];
      const errors: any[] = [];

      for (const studentData of studentsData) {
        try {
          // Generar username si no se proporciona
          const username =
            studentData.username ||
            `${studentData.nombre.toLowerCase()}.${studentData.apellido.toLowerCase()}`.replace(/\s+/g, '');

          // Buscar si el usuario ya existe
          let user = await tx.users.findFirst({
            where: {
              OR: [
                { username },
                studentData.email ? { email: studentData.email } : {},
              ],
            },
          });

          // Si no existe y autoCreateUsers está activado, crear el usuario
          if (!user && autoCreateUsers) {
            const defaultPassword = await bcrypt.hash('Student123!', 10);
            user = await tx.users.create({
              data: {
                username,
                email: studentData.email || null,
                password_hash: defaultPassword,
                role: 'student',
                display_name: `${studentData.nombre} ${studentData.apellido}`,
                is_active: true,
              },
            });
          }

          if (!user) {
            errors.push({
              data: studentData,
              error: 'User does not exist and auto-create is disabled',
            });
            continue;
          }

          // Verificar que sea estudiante
          if (user.role !== 'student') {
            errors.push({
              data: studentData,
              error: 'User is not a student',
            });
            continue;
          }

          // Agregar a la lista
          try {
            await tx.class_list_students.create({
              data: {
                list_id: classList.list_id,
                user_id: user.user_id,
                nickname: studentData.nickname,
              },
            });

            created.push({
              user_id: user.user_id,
              username: user.username,
              display_name: user.display_name,
              was_created: !studentData.username && !studentData.email,
            });
          } catch (error: any) {
            // Si ya existe en la lista, ignorar
            if (error.code === 'P2002') {
              created.push({
                user_id: user.user_id,
                username: user.username,
                display_name: user.display_name,
                was_created: false,
                already_in_list: true,
              });
            } else {
              throw error;
            }
          }
        } catch (error: any) {
          errors.push({
            data: studentData,
            error: error.message,
          });
        }
      }

      return { created, errors, listId: classList.list_id };
    });

    return {
      classList,
      studentsAdded: result.created.length,
      studentsCreated: result.created.filter((s: any) => s.was_created).length,
      errors: result.errors,
      details: result.created,
    };
  }
}

export default new ClassListService();

