const aws = {
  region: process.env.AWS_REGION ?? 'us-east-1',
};

const dynamo = {
  todosTable: process.env.TODOS_TABLE ?? 'TodosRamboTable',
};

const service = {
  name: process.env.SERVICE_NAME ?? 'fallback-service-name',
};

export default {
  aws,
  dynamo,
  service,
};
