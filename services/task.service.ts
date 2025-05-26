import { Task, TaskWithSubject } from "@/lib/types";
import {
  subjectRepository,
  SubjectRepository,
} from "@/repositories/subject.repository";
import { taskRepository, TaskRepository } from "@/repositories/task.repository";

export class TaskService {
  private taskRepository: TaskRepository;
  private subjectRepository: SubjectRepository;

  constructor(
    taskRepository: TaskRepository,
    subjectRepository: SubjectRepository,
  ) {
    this.taskRepository = taskRepository;
    this.subjectRepository = subjectRepository;
  }

  public async getTasks(user_id: string): Promise<TaskWithSubject[]> {
    try {
      const tasks = await this.taskRepository.getTasks(user_id);

      const tasksWithSubjects: TaskWithSubject[] = await Promise.all(
        tasks.map(async (task) => {
          const subject = await this.subjectRepository.getSubjectById(
            task.subject_id,
          );

          if (!subject) {
            throw new Error(`Subject with ID ${task.subject_id} not found`);
          }

          return {
            ...task,
            subject: subject,
          };
        }),
      );

      return tasksWithSubjects;
    } catch (error) {
      console.error("Error al obtener las tareas:", error);
      throw error;
    }
  }

  public async getTaskById(
    task_id: string,
  ): Promise<TaskWithSubject | undefined> {
    try {
      const task = await this.taskRepository.getTaskById(task_id);

      if (!task) {
        throw new Error(`Task with ID ${task_id} not found`);
      }

      const subject = await this.subjectRepository.getSubjectById(
        task?.subject_id,
      );

      if (!subject) {
        throw new Error(`Subject with ID ${task.subject_id} not found`);
      }

      const taskWithSubject: TaskWithSubject = {
        ...task,
        subject: subject,
      };

      return taskWithSubject;
    } catch (error) {
      console.error("Error al obtener la tarea:", error);
      throw error;
    }
  }

  public async createTask(
    name: string,
    description: string,
    due_date: string,
    subject_id: string,
    status: string,
    user_id: string,
  ): Promise<Task> {
    const task = {
      task_id: crypto.randomUUID(),
      name,
      description,
      due_date,
      subject_id,
      status,
      user_id,
    };

    try {
      const createdTask = await this.taskRepository.createTask(task);
      return createdTask;
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      throw error;
    }
  }

  public async updateTask(task: Task): Promise<void> {
    try {
      await this.taskRepository.updateTask(task);
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
      throw error;
    }
  }

  public async deleteTask(task_id: string): Promise<void> {
    try {
      await this.taskRepository.deleteTask(task_id);
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
      throw error;
    }
  }
}

export const taskService = new TaskService(taskRepository, subjectRepository);
