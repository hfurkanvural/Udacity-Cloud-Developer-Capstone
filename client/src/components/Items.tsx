import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  GridColumn
} from 'semantic-ui-react'

import { createItem, deleteItem, getItems, patchItem } from '../api/items-api'
import Auth from '../auth/Auth'
import { Item } from '../types/Item' 

interface ItemsProps {
  auth: Auth
  history: History
}

interface ItemsState {
  items: Item[]
  newItemName: string
  newItemDesc: string
  loadingItems: boolean
}

export class Items extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    items: [],
    newItemName: '',
    newItemDesc: '',
    loadingItems: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemName: event.target.value })
  }
  handleDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemDesc: event.target.value })
  }
  onEditButtonClick = (itemId: string) => {
    this.props.history.push(`/items/${itemId}/edit`)
  }

  onItemCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const Date = this.calculateDate()
      const newItem = await createItem(this.props.auth.getIdToken(), {
        name: this.state.newItemName,
        desc: this.state.newItemDesc,
        Date
      })
      this.setState({
        items: [...this.state.items, newItem],
        newItemName: ''
      })
    } catch {
      alert('Item creation failed')
    }
  }

  onItemDelete = async (itemId: string) => {
    try {
      await deleteItem(this.props.auth.getIdToken(), itemId)
      this.setState({
        items: this.state.items.filter(item => item.itemId != itemId)
      })
    } catch {
      alert('Item deletion failed')
    }
  }

  onItemCheck = async (pos: number) => {
    try {
      const item = this.state.items[pos]
      await patchItem(this.props.auth.getIdToken(), item.itemId, {
        name: item.name,
        desc: item.desc,
        Date: item.Date,
        liked: !item.liked
      })
      this.setState({
        items: update(this.state.items, {
          [pos]: { liked: { $set: !item.liked } }
        })
      })
    } catch {
      alert('Item deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const items = await getItems(this.props.auth.getIdToken())
      this.setState({
        items,
        loadingItems: false
      })
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Memories</Header>

        {this.renderCreateItemInput()}

        {this.renderItems()}
      </div>
    )
  }

  renderCreateItemInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            placeholder="Memory Title"
            onChange={this.handleNameChange}
          />
          <Input
            action={{
              color: 'teal',
              labelPosition: 'righy',
              icon: 'add',
              content: 'New Memory',
              onClick: this.onItemCreate
            }}
            fluid
            placeholder="Memory Description"
            onChange={this.handleDescChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderItems() {
    if (this.state.loadingItems) {
      return this.renderLoading()
    }

    return this.renderItemsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Memories
        </Loader>
      </Grid.Row>
    )
  }

  renderItemsList() {
    return (
      <Grid padded>
        <Grid.Row>
              <Grid.Column width={4} verticalAlign="middle" floated="left">
                Memory Picture
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="middle">
                Memory Title
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle">
                Memory Description
              </Grid.Column>
              <Grid.Column width={2} floated="right" verticalAlign="middle">
                Memory Date
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle">
                Liked?
              </Grid.Column>
              <Grid.Column width={1} floated="right" verticalAlign="middle">
                Transactions
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
        {this.state.items.map((item, pos) => {
          return (
            <Grid.Row key={item.itemId}>
              <Grid.Column width={4} verticalAlign="middle" floated="left">
                {item.attachmentUrl && (
                  <Image src={item.attachmentUrl} size="medium" wrapped />
                )}
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="middle">
                {item.name}
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle">
                {item.desc}
              </Grid.Column>
              <Grid.Column width={2} floated="right" verticalAlign="middle">
                Memory Date: {item.Date}
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onItemCheck(pos)}
                  checked={item.liked}
                />Liked
              </Grid.Column>
              <Grid.Column width={1} floated="right" verticalAlign="middle">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(item.itemId)}
                >
                  <Icon name="pencil" />
                </Button>
                <Button
                  icon
                  color="red"
                  onClick={() => this.onItemDelete(item.itemId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
