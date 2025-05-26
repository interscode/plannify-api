import { BillingMode, CreateTableCommandInput } from "@aws-sdk/client-dynamodb";

export const sheduleSchema: CreateTableCommandInput = {
  TableName: "schedule",
  KeySchema: [
    {
      AttributeName: "shedule_id",
      KeyType: "HASH",
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: "shedule_id",
      AttributeType: "S",
    },
  ],
  BillingMode: BillingMode.PAY_PER_REQUEST,
};

export const subjectSchema: CreateTableCommandInput = {
  AttributeDefinitions: [
    {
      AttributeName: "subject_id",
      AttributeType: "S",
    },
  ],
  KeySchema: [
    {
      AttributeName: "subject_id",
      KeyType: "HASH",
    },
  ],
  TableName: "subject",
  StreamSpecification: {
    StreamEnabled: false,
  },
  BillingMode: BillingMode.PAY_PER_REQUEST,
};

export const taskSchema: CreateTableCommandInput = {
  AttributeDefinitions: [
    {
      AttributeName: "task_id",
      AttributeType: "S",
    },
  ],
  KeySchema: [
    {
      AttributeName: "task_id",
      KeyType: "HASH",
    },
  ],
  TableName: "task",
  StreamSpecification: {
    StreamEnabled: false,
  },
  BillingMode: BillingMode.PAY_PER_REQUEST,
};

export type TableSchema = {
  AttributeDefinitions: {
    AttributeName: string;
    AttributeType: string;
  }[];
  KeySchema: {
    AttributeName: string;
    KeyType: string;
  }[];
  ProvisionedThroughput: {
    ReadCapacityUnits: number;
    WriteCapacityUnits: number;
  };
  TableName: string;
  StreamSpecification: {
    StreamEnabled: boolean;
  };
};
