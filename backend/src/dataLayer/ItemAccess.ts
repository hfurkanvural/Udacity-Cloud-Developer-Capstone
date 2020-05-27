import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Item } from '../models/Item';
import { ItemUpdate } from '../models/ItemUpdate';
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('DBAccess');
const XAWS = AWSXRay.captureAWS(AWS);

export default class ItemAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly itemsTable = process.env.TABLE_NAME,
    private readonly indexName = process.env.ID_INDEX
  ) { }

  async addItem(itemItem: Item) {
    await this.docClient.put({
      TableName: this.itemsTable,
      Item: itemItem
    }).promise();
  }

  async deleteItem(itemId: string, userId: string) {
    await this.docClient.delete({
      TableName: this.itemsTable,
      Key: {
        itemId,
        userId
      }
    }).promise();
  }

  async getItem(itemId: string, userId: string) {
    const result = await this.docClient.get({
      TableName: this.itemsTable,
      Key: {
        itemId,
        userId
      }
    }).promise();

    return result.Item as Item;
  }

  async getAllItems(userId: string) {
    const result = await this.docClient.query({
      TableName: this.itemsTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();

    return result.Items as Item[];
  }

  async updateItem(itemId: string, userId: string, updatedItem: ItemUpdate) {
    await this.docClient.update({
      TableName: this.itemsTable,
      Key: {
        itemId,
        userId
      },
      UpdateExpression: 'set #name = :n, #Date = :due, #liked = :d',
      ExpressionAttributeValues: {
        ':n': updatedItem.name,
        ':due': updatedItem.Date,
        ':d': updatedItem.liked
      },
      ExpressionAttributeNames: {
        '#name': 'name',
        '#Date': 'Date',
        '#liked': 'liked'
      }
    }).promise();
  }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE === 'true') {

      logger.info('Creating a local DynamoDB instance');

      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }