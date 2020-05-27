import 'source-map-support/register';
import * as uuid from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';

import ItemAccess from '../dataLayer/ItemAccess';
import BucketAccess from '../dataLayer/bucketAccess';
import { getUserId } from '../lambda/utils';
import { CreateItemRequest } from '../requests/CreateItemRequest';
import { UpdateItemRequest } from '../requests/UpdateItemRequest';
import { Item } from '../models/Item';
import { createLogger } from '../utils/logger'

const itemAccess = new ItemAccess();
const bucketAccess = new BucketAccess();
const logger = createLogger('businessLogic');

export async function createItem(event: APIGatewayProxyEvent,
                                 CreateItemRequest: CreateItemRequest): Promise<Item> {
  const itemId = uuid.v4();
  const userId = getUserId(event);
  const createdAt = new Date(Date.now()).toISOString();

  const itemItem = {
    userId,
    itemId,
    createdAt,
    liked: false,
    attachmentUrl: `https://${bucketAccess.getBucketName()}.s3.amazonaws.com/${itemId}`,
    ...CreateItemRequest
  };

  logger.info('Creating new item');
  await itemAccess.addItem(itemItem);

  return itemItem;
}

export async function getItem(event: APIGatewayProxyEvent) {
  const itemId = event.pathParameters.itemId;
  const userId = getUserId(event);

  return await itemAccess.getItem(itemId, userId);
}

export async function getItems(event: APIGatewayProxyEvent) {
  const userId = getUserId(event);

  return await itemAccess.getAllItems(userId);
}

export async function updateItem(event: APIGatewayProxyEvent,
                                 UpdateItemRequest: UpdateItemRequest) {
  const itemId = event.pathParameters.itemId;
  const userId = getUserId(event);

  if (!(await itemAccess.getItem(itemId, userId))) {
    return false;
  }

  logger.info('Updating item');
  await itemAccess.updateItem(itemId, userId, UpdateItemRequest);

  return true;
}

export async function deleteItem(event: APIGatewayProxyEvent) {
  const itemId = event.pathParameters.itemId;
  const userId = getUserId(event);

  if (!(await itemAccess.getItem(itemId, userId))) {
    return false;
  }

  logger.info('Deleting item');
  await itemAccess.deleteItem(itemId, userId);

  return true;
}

export async function generateUploadUrl(event: APIGatewayProxyEvent) {
  const bucket = bucketAccess.getBucketName();
  const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
  const itemId = event.pathParameters.itemId;

  const createSignedUrlRequest = {
    Bucket: bucket,
    Key: itemId,
    Expires: urlExpiration
  }

  logger.info('Generated Upload URL');
  return bucketAccess.getPresignedUploadURL(createSignedUrlRequest);
}