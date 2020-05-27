/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateItemRequest {
  name: string
  desc: string
  Date: string
  liked: boolean
}