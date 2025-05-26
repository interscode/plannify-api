import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { subjectSchema } from "@/lib/schemas";
import { Subject } from "@/lib/types";
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import { ddbClient } from "@/lib/ddb";

export class SubjectRepository {
  private ddb: DynamoDBDocumentClient;

  constructor(ddb: DynamoDBDocumentClient) {
    this.ddb = ddb;
    this.createTableIfNotExists();
  }

  private async createTableIfNotExists() {
    try {
      await this.ddb.send(
        new DescribeTableCommand({ TableName: subjectSchema.TableName }),
      );
      console.log(`Tabla '${subjectSchema.TableName}' ya existe.`);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        console.log(
          `Tabla '${subjectSchema.TableName}' no encontrada. Creándola...`,
        );
        try {
          await this.ddb.send(new CreateTableCommand(subjectSchema));
          await this.waitUntilTableActive();
          console.log(`Tabla '${subjectSchema.TableName}' creada y activa.`);
        } catch (createError) {
          console.error(
            `Error al crear la tabla '${subjectSchema.TableName}':`,
            createError,
          );
          throw createError;
        }
      } else {
        console.error(
          `Error al describir la tabla '${subjectSchema.TableName}':`,
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
          new DescribeTableCommand({ TableName: subjectSchema.TableName }),
        );
        if (data.Table && data.Table.TableStatus === "ACTIVE") {
          return; // La tabla está activa
        }
      } catch (error) {
        // Ignoramos errores durante la espera si es ResourceNotFoundException,
        // ya que la tabla podría estar en proceso de creación.
      }
      console.log(
        `Esperando a que la tabla '${
          subjectSchema.TableName
        }' esté activa... Intento ${attempts + 1}/${maxAttempts}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      attempts++;
    }
    throw new Error(
      `La tabla '${
        subjectSchema.TableName
      }' no se activó después de ${maxAttempts} intentos.`,
    );
  }

  public async getSubjects(user_id: string): Promise<any[]> {
    const params = {
      TableName: subjectSchema.TableName,
      FilterExpression: "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
      },
    };

    try {
      const { Items } = await this.ddb.send(new ScanCommand(params));
      return (Items || []) as Subject[];
    } catch (error) {
      console.error("Error al obtener los subjects:", error);
      throw error;
    }
  }

  public async getSubjectById(
    subject_id: string,
  ): Promise<Subject | undefined> {
    const params = {
      TableName: subjectSchema.TableName,
      Key: {
        subject_id,
      },
    };

    try {
      const { Item } = await this.ddb.send(new GetCommand(params));
      return Item as Subject | undefined;
    } catch (error) {
      console.error("Error al obtener el subject:", error);
      throw error;
    }
  }

  public async createSubject(subject: Subject): Promise<Subject> {
    const params = {
      TableName: subjectSchema.TableName,
      Item: subject,
    };

    try {
      await this.ddb.send(new PutCommand(params));
      return subject;
    } catch (error) {
      console.error("Error al crear el subject:", error);
      throw error;
    }
  }

  public async updateSubject(subject: Subject): Promise<void> {
    const params = {
      TableName: subjectSchema.TableName,
      Key: {
        subject_id: subject.subject_id,
      },
      UpdateExpression:
        "set #name = :name, #teacher = :teacher, #classroom = :classroom, #color = :color, #emoji = :emoji, #day = :day, #start_time = :start_time, #end_time = :end_time, #tasks_ids = :tasks_ids, #user_id = :user_id",
      ExpressionAttributeNames: {
        "#name": "name",
        "#teacher": "teacher",
        "#classroom": "classroom",
        "#color": "color",
        "#emoji": "emoji",
        "#day": "day",
        "#start_time": "start_time",
        "#end_time": "end_time",
        "#tasks_ids": "tasks_ids",
        "#user_id": "user_id",
      },
      ExpressionAttributeValues: {
        ":name": subject.name,
        ":teacher": subject.teacher,
        ":classroom": subject.classroom,
        ":color": subject.color,
        ":emoji": subject.emoji,
        ":day": subject.day,
        ":start_time": subject.start_time,
        ":end_time": subject.end_time,
        ":tasks_ids": subject.tasks_ids,
        ":user_id": subject.user_id,
      },
    };

    try {
      await this.ddb.send(new UpdateCommand(params));
    } catch (error) {
      console.error("Error al actualizar el subject:", error);
      throw error;
    }
  }

  public async deleteSubject(subject_id: string): Promise<void> {
    const params = {
      TableName: subjectSchema.TableName,
      Key: {
        subject_id,
      },
    };

    try {
      await this.ddb.send(new DeleteCommand(params));
    } catch (error) {
      console.error("Error al eliminar el subject:", error);
      throw error;
    }
  }
}

export const subjectRepository = new SubjectRepository(ddbClient);
