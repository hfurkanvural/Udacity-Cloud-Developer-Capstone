import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateItemRequest } from '../../requests/CreateItemRequest';
import { createItem } from '../../businessLogic/items';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newItem: CreateItemRequest = JSON.parse(event.body);

  if (!newItem.name) {
    return {
      statusCode: 400, //Bad Request
      body: JSON.stringify({
        error: 'Item input criteria faulty'
      })
    };
  }

  handler.use(
    cors({
      credentials: true
    })
  )

  const itemItem = await createItem(event, newItem);

  return {
    statusCode: 201, //Created
    body: JSON.stringify({
      item: itemItem
    })
  };
})