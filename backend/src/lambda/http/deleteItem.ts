import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { deleteItem } from '../../businessLogic/items';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  if (!(await deleteItem(event))) {
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
    statusCode: 202, //Accepted
    body: JSON.stringify({})
  };
})