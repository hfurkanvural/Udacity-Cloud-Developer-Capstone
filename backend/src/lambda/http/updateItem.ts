import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { updateItem }  from '../../businessLogic/items';
import { UpdateItemRequest } from '../../requests/UpdateItemRequest';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const updatedItem: UpdateItemRequest = JSON.parse(event.body);

  const updated = await updateItem(event, updatedItem);
  if (!updated) {
    return {
      statusCode: 404, //Not Found
      body: JSON.stringify({
        error: 'Item not found'
      })
    };
  }

  handler.use(
    cors({
      credentials: true
    })
  )

  return {
    statusCode: 200, //OK
    body: JSON.stringify({})
  }
})