import { ddbClient } from "@/lib/ddb";
import { taskSchema } from "@/lib/schemas";
import { Task } from "@/lib/types";
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

export class TaskRepository {
  private ddb: DynamoDBDocumentClient;

  constructor(ddb: DynamoDBDocumentClient) {
    this.ddb = ddb;
    this.createTableIfNotExists();
  }

  private async createTableIfNotExists() {
    try {
      await this.ddb.send(
        new DescribeTableCommand({ TableName: taskSchema.TableName }),
      );
      console.log(`Tabla '${taskSchema.TableName}' ya existe.`);
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        console.log(
          `Tabla '${taskSchema.TableName}' no encontrada. Creándola...`,
        );
        try {
          await this.ddb.send(new CreateTableCommand(taskSchema));
          await this.waitUntilTableActive();
          console.log(`Tabla '${taskSchema.TableName}' creada y activa.`);
        } catch (createError) {
          console.error(
            `Error al crear la tabla '${taskSchema.TableName}':`,
            createError,
          );
          throw createError;
        }
      } else {
        console.error(
          `Error al describir la tabla '${taskSchema.TableName}':`,
          error,
        );
        throw error;
      }
    }
  }

  private async waitUntilTableActive(): Promise<void> {
    const maxAttempts = 20;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        await this.ddb.send(
          new DescribeTableCommand({ TableName: taskSchema.TableName }),
        );
        return;
      } catch (error) {
        if (error instanceof ResourceNotFoundException) {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          throw error;
        }
      }
    }

    throw new Error(
      `La tabla '${taskSchema.TableName}' no se activó a tiempo.`,
    );
  }

  public async getTasks(user_id: string): Promise<Task[]> {
    try {
      const { Items } = await this.ddb.send(
        new ScanCommand({
          TableName: taskSchema.TableName,
          FilterExpression: "#user_id = :user_id",
          ExpressionAttributeNames: {
            "#user_id": "user_id",
          },
          ExpressionAttributeValues: {
            ":user_id": user_id,
          },
        }),
      );
      return (Items || []) as Task[];
    } catch (error) {
      console.error("Error al obtener las tareas:", error);
      throw error;
    }
  }

  public async getTaskById(task_id: string): Promise<Task | undefined> {
    try {
      const { Item } = await this.ddb.send(
        new GetCommand({
          TableName: taskSchema.TableName,
          Key: { task_id },
        }),
      );
      return Item as Task;
    } catch (error) {
      console.error("Error al obtener la tarea:", error);
      throw error;
    }
  }

  public async createTask(task: Task): Promise<Task> {
    try {
      await this.ddb.send(
        new PutCommand({
          TableName: taskSchema.TableName,
          Item: task,
        }),
      );
      return task;
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      throw error;
    }
  }

  public async updateTask(task: Task): Promise<void> {
    try {
      await this.ddb.send(
        new UpdateCommand({
          TableName: taskSchema.TableName,
          Key: { task_id: task.task_id },
          UpdateExpression:
            "set #name = :name, #description = :description, #due_date = :due_date, #subject_id = :subject_id, #status = :status, #user_id = :user_id",
          ExpressionAttributeNames: {
            "#name": "name",
            "#description": "description",
            "#due_date": "due_date",
            "#subject_id": "subject_id",
            "#status": "status",
            "#user_id": "user_id",
          },
          ExpressionAttributeValues: {
            ":name": task.name,
            ":description": task.description,
            ":due_date": task.due_date,
            ":subject_id": task.subject_id,
            ":status": task.status,
            ":user_id": task.user_id,
          },
        }),
      );
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
      throw error;
    }
  }

  public async deleteTask(task_id: string): Promise<void> {
    try {
      await this.ddb.send(
        new DeleteCommand({
          TableName: taskSchema.TableName,
          Key: { task_id },
        }),
      );
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
      throw error;
    }
  }
}

export const taskRepository = new TaskRepository(ddbClient);
