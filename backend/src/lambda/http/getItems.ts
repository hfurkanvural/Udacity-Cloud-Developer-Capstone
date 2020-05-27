import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getItems } from '../../businessLogic/items';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  handler.use(
    cors({
      credentials: true
    })
  )

  return {
    statusCode: 200, //OK
    body: JSON.stringify({
      items: await getItems(event)
    })
  };
})