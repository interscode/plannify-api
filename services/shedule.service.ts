import { Shedule } from "@/lib/types";
import {
  scheduleRepository,
  ScheduleRepository,
} from "@/repositories/shedule.repository";

export class SheduleService {
  private sheduleRepository: ScheduleRepository;

  constructor(sheduleRepository: ScheduleRepository) {
    this.sheduleRepository = sheduleRepository;
  }

  public async getSchedule(user_id: string): Promise<Shedule[]> {
    try {
      const schedules = await this.sheduleRepository.getShedule(user_id);
      return schedules;
    } catch (error) {
      console.error("Error al obtener los horarios:", error);
      throw error;
    }
  }

  public async createSchedule(
    start_time: string,
    end_time: string,
    subjects_ids: string[],
    user_id: string,
  ): Promise<Shedule> {
    const schedule = {
      shedule_id: crypto.randomUUID(),
      start_time,
      end_time,
      subjects_ids,
      user_id,
    };

    try {
      const createdSchedule =
        await this.sheduleRepository.createSchedule(schedule);
      return createdSchedule;
    } catch (error) {
      console.error("Error al crear el horario:", error);
      throw error;
    }
  }

  public async updateSchedule(
    shedule_id: string,
    start_time: string,
    end_time: string,
    subjects_ids: string[],
    user_id: string,
  ): Promise<void> {
    const schedule = {
      shedule_id,
      start_time,
      end_time,
      subjects_ids,
      user_id,
    };

    try {
      await this.sheduleRepository.updateSchedule(schedule);
    } catch (error) {
      console.error("Error al actualizar el horario:", error);
      throw error;
    }
  }

  public async deleteSchedule(shedule_id: string): Promise<void> {
    try {
      await this.sheduleRepository.deleteSchedule(shedule_id);
    } catch (error) {
      console.error("Error al eliminar el horario:", error);
      throw error;
    }
  }
}

export const sheduleService = new SheduleService(scheduleRepository);
