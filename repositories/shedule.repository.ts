import { ddbClient } from "@/lib/ddb";
import { sheduleSchema } from "@/lib/schemas";
import { Shedule } from "@/lib/types";
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

export class ScheduleRepository {
  private ddb: DynamoDBDocumentClient;

  constructor(ddb: DynamoDBDocumentClient) {
    this.ddb = ddb;
    this.createTableIfNotExists();
  }

  private async createTableIfNotExists() {
    try {
      await this.ddb.send(
        new DescribeTableCommand({ TableName: sheduleSchema.TableName }),
      );
      console.log(`Tabla '${sheduleSchema.TableName}' ya existe.`);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        console.log(
          `Tabla '${sheduleSchema.TableName}' no encontrada. Creándola...`,
        );
        try {
          await this.ddb.send(new CreateTableCommand(sheduleSchema));
          await this.waitUntilTableActive();
          console.log(`Tabla '${sheduleSchema.TableName}' creada y activa.`);
        } catch (createError) {
          console.error(
            `Error al crear la tabla '${sheduleSchema.TableName}':`,
            createError,
          );
          throw createError;
        }
      } else {
        console.error(
          `Error al describir la tabla '${sheduleSchema.TableName}':`,
          error,
        );
        throw error;
      }
    }
  }

  private async waitUntilTableActive(): Promise<void> {
    const maxAttempts = 20;
    let attempts = 0;
    const delayMs = 5000; // 5 segundos

    while (attempts < maxAttempts) {
      try {
        const data = await this.ddb.send(
          new DescribeTableCommand({ TableName: sheduleSchema.TableName }),
        );
        if (data.Table && data.Table.TableStatus === "ACTIVE") {
          return; // La tabla está activa
        }
      } catch (error) {
        // Ignoramos errores durante la espera si es ResourceNotFoundException,
        // ya que la tabla podría estar en proceso de creación.
      }
      console.log(
        `Esperando a que la tabla '${sheduleSchema.TableName}' esté activa... Intento ${
          attempts + 1
        }/${maxAttempts}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      attempts++;
    }
    throw new Error(
      `La tabla '${sheduleSchema.TableName}' no se activó después de ${maxAttempts} intentos.`,
    );
  }

  public async getShedule(user_id: string): Promise<Shedule[]> {
    const params = {
      TableName: sheduleSchema.TableName,
      FilterExpression: "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
      },
    };

    try {
      const data = await this.ddb.send(new ScanCommand(params));
      return data.Items as Shedule[];
    } catch (error) {
      console.error("Error al obtener los horarios:", error);
      throw error;
    }
  }

  public async createSchedule(schedule: Shedule): Promise<Shedule> {
    const params = {
      TableName: sheduleSchema.TableName,
      Item: {
        shedule_id: schedule.shedule_id,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        subjects_ids: schedule.subjects_ids,
        user_id: schedule.user_id,
      },
    };

    try {
      await this.ddb.send(new PutCommand(params));
      return schedule;
    } catch (error) {
      console.error("Error al crear el horario:", error);
      throw error;
    }
  }

  public async updateSchedule(schedule: Shedule): Promise<void> {
    const params = {
      TableName: sheduleSchema.TableName,
      Key: {
        shedule_id: schedule.shedule_id,
      },
      UpdateExpression:
        "SET start_time = :start_time, end_time = :end_time, subjects_ids = :subjects_ids, user_id = :user_id",
      ExpressionAttributeValues: {
        ":start_time": schedule.start_time,
        ":end_time": schedule.end_time,
        ":subjects_ids": schedule.subjects_ids,
        ":user_id": schedule.user_id,
      },
    };

    try {
      await this.ddb.send(new UpdateCommand(params));
    } catch (error) {
      console.error("Error al actualizar el horario:", error);
      throw error;
    }
  }

  public async deleteSchedule(shedule_id: string): Promise<void> {
    const params = {
      TableName: sheduleSchema.TableName,
      Key: {
        shedule_id: shedule_id,
      },
    };

    try {
      await this.ddb.send(new DeleteCommand(params));
    } catch (error) {
      console.error("Error al eliminar el horario:", error);
      throw error;
    }
  }
}

export const scheduleRepository = new ScheduleRepository(ddbClient);
