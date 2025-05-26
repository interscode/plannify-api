import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const ddb = new DynamoDBClient({ region: "us-east-1" });
export const ddbClient = DynamoDBDocumentClient.from(ddb);
