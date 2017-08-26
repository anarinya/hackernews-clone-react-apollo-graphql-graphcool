import React, { Component } from 'react';
import { gql, withApollo } from 'react-apollo';
import { Link } from './';

class Search extends Component {

  state = {
    links: [],
    searchText: ''
  };

  _executeSearch = async () => {
    const { searchText } = this.state;
    const { client } = this.props;
    const result = await client.query({
      query: ALL_LINKS_SEARCH_QUERY,
      variables: { searchText }
    });
    const links = result.data.allLinks;
    console.log(links);
    this.setState({ links });
  }

  render() {
    const { links } = this.state;

    return (
      <div>
        <div>
          Search
          <input 
            type='text'
            onChange={ (e) => this.setState({ searchText: e.target.value })}
          />
          <button onClick={ () => this._executeSearch() }>OK</button>
        </div>
        { links.map((link, i) => <Link key={link.id} link={link} index={i} />) }
      </div>
    );
  }
}

const ALL_LINKS_SEARCH_QUERY = gql`
  query AllLinksSearchQuery($searchText: String!) {
    allLinks(filter: {
      OR: [{
        url_contains: $searchText
      }, {
        description_contains: $searchText
      }]
    }) {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user { id }
      }
    }
  }
`;

export default withApollo(Search);