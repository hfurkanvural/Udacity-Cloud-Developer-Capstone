import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { generateUploadUrl } from '../../businessLogic/items';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const signedUrl = await generateUploadUrl(event);

  handler.use(
    cors({
      credentials: true
    })
  )

  return {
    statusCode: 202, //Accepted
    body: JSON.stringify({
      uploadUrl: signedUrl
    })
  };
})