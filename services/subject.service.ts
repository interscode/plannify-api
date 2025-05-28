import { InputSubject, Subject } from "@/lib/types";
import {
  subjectRepository,
  SubjectRepository,
} from "@/repositories/subject.repository";

export class SubjectService {
  private subjectRepository: SubjectRepository;

  constructor(subjectRepository: SubjectRepository) {
    this.subjectRepository = subjectRepository;
  }

  public async getSubjects(user_id: string): Promise<Subject[]> {
    try {
      const subjects = await this.subjectRepository.getSubjects(user_id);
      return subjects;
    } catch (error) {
      console.error("Error al obtener las materias:", error);
      throw error;
    }
  }

  public async getSubjectById(
    subject_id: string,
  ): Promise<Subject | undefined> {
    try {
      const subject = await this.subjectRepository.getSubjectById(subject_id);
      return subject;
    } catch (error) {
      console.error("Error al obtener la materia:", error);
      throw error;
    }
  }

  public async addSubjectsToSchedule(
    subjects: InputSubject[],
    user_id: string,
  ): Promise<Subject[] | undefined> {
    try {
      const subjectsCreated =
        await this.subjectRepository.addSubjectsToSchedule(subjects, user_id);
      return subjectsCreated;
    } catch (error) {
      console.error("Error al agregar materias al horario:", error);
      throw error;
    }
  }

  public async createSubject(
    name: string,
    teacher: string,
    classroom: string,
    color: string,
    emoji: string,
    day: string,
    start_time: string,
    end_time: string,
    tasks_ids: string[],
    user_id: string,
  ): Promise<Subject> {
    const subject = {
      subject_id: crypto.randomUUID(),
      name,
      teacher,
      classroom,
      color,
      emoji,
      day,
      start_time,
      end_time,
      tasks_ids,
      user_id,
    };

    try {
      const createdSubject =
        await this.subjectRepository.createSubject(subject);
      return createdSubject;
    } catch (error) {
      console.error("Error al crear la materia:", error);
      throw error;
    }
  }

  public async updateSubject(
    subject_id: string,
    name: string,
    teacher: string,
    classroom: string,
    color: string,
    emoji: string,
    day: string,
    start_time: string,
    end_time: string,
    tasks_ids: string[],
    user_id: string,
  ): Promise<void> {
    const subject = {
      subject_id,
      name,
      teacher,
      classroom,
      color,
      emoji,
      day,
      start_time,
      end_time,
      tasks_ids,
      user_id,
    };

    try {
      await this.subjectRepository.updateSubject(subject);
    } catch (error) {
      console.error("Error al actualizar la materia:", error);
      throw error;
    }
  }

  public async deleteSubject(subject_id: string): Promise<void> {
    try {
      await this.subjectRepository.deleteSubject(subject_id);
    } catch (error) {
      console.error("Error al eliminar la materia:", error);
      throw error;
    }
  }
}

export const subjectService = new SubjectService(subjectRepository);
