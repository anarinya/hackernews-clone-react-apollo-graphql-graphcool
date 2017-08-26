import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo';

import { GC_USER_ID, LINKS_PER_PAGE } from '../constants';
import { ALL_LINKS_QUERY } from './LinkList';

class CreateLink extends Component {

  state = {
    description: '',
    url: ''
  };

  render() {
    const FIELDS = [{
      name: 'description',
      placeholder: 'A description for the link'
    }, {
      name: 'url',
      placeholder: 'The url for the link'
    }];

    return (
      <div>
        <div className='flex flex-column mt3'>
          { FIELDS.map(field => this._createTextField(field)) }
        </div>
        <button onClick={ () => this._createLink() }>Submit</button>
      </div>
    );
  }

  _handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  async _createLink() {
    const { createLinkMutation, history } = this.props;
    const postedById = localStorage.getItem(GC_USER_ID);

    if (!postedById) {
      console.error('No user logged in.');
      return;
    }

    const { description, url } = this.state;

    await createLinkMutation({
      variables: {
        description,
        url,
        postedById
      },
      update:(store, { data: { createLink } }) => {
        const first = LINKS_PER_PAGE;
        const skip = 0;
        const orderBy = 'createdAt_DESC';
        const data = store.readQuery({
          query: ALL_LINKS_QUERY,
          variables: { first, skip, orderBy }
        });

        data.allLinks.splice(0, 0, createLink);
        data.allLinks.pop();

        store.writeQuery({ 
          query: ALL_LINKS_QUERY,
          data,
          variables: { first, skip, orderBy }
        });
      }
    });
    // after creating the new link, redirect back to the link list
    history.push('/');
  }

  _createTextField(field) {
    return (
      <input 
        key={ field.name }
        name={ field.name }
        className='mb2'
        value={ this.state[field.name] }
        onChange={ this._handleInputChange }
        type='text'
        placeholder={ field.placeholder }
      /> 
    );
  }
}

const CREATE_LINK_MUTATION = gql`
  mutation CreateLinkMutation(
    $description: String!, 
    $url: String!,
    $postedById: ID!) {
    createLink(
      description: $description,
      url: $url,
      postedById: $postedById
    ) {
      id
      createdAt
      url
      description
      postedBy { id name }
    }
  }
`;

export default graphql(
  CREATE_LINK_MUTATION, 
  { name: 'createLinkMutation'}
)(CreateLink);