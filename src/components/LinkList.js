import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo';

import { Link } from './';
import { LINKS_PER_PAGE } from '../constants';

class LinkList extends Component {

  componentDidMount() {
    this._subscribeToNewLinks();
    this._subscribeToNewVotes();
  }

  render() {
    const { allLinksQuery, location, match } = this.props;
    // If query is available but still loading...
    if (allLinksQuery && allLinksQuery.loading) {
      return <div>Loading</div>;
    }
    // If query is available but an error occurred....
    if (allLinksQuery && allLinksQuery.error) {
      return <div>{ allLinksQuery.error.toString() }</div>;
    }
    // Done loading, no errors, data available
    const isNewPage = location.pathname.includes('new');
    const linksToRender = this._getLinksToRender(isNewPage);
    const page = parseInt(match.params.page, 10);

    return (
      <div>
        <div>
          { // Render each link object from data array
            linksToRender.map((link, index) => (
            <Link 
              key={link.id} 
              updateStoreAfterVote={this._updateCacheAfterVote}
              //index={index} 
              index={page ? (page - 1) * LINKS_PER_PAGE + index : index}
              link={link} 
            />
          ))}
        </div>
        { isNewPage &&
          <div className='flex ml4 mv3 gray'>
            <button className='pointer mr2' onClick={ () => this._previousPage() }>Previous</button>
            <button className='pointer' onClick={ () => this._nextPage() }>Next</button>
          </div>
        }
      </div>
    );
  }

  _updateCacheAfterVote = (store, createVote, linkId) => {
    const { location, match } = this.props;
    const isNewPage = location.pathname.includes('new');
    const page = parseInt(match.params.page, 10);
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 10;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;

    const data = store.readQuery({ query: ALL_LINKS_QUERY, variables: {
      first, skip, orderBy
    }});

    const votedLink = data.allLinks.find(link => link.id === linkId);
    // Reset link's votes to votes returned by the server
    votedLink.votes = createVote.link.votes;
    // Update data store
    store.writeQuery({ query: ALL_LINKS_QUERY, data });
  }

  _subscribeToNewLinks = () => {
    const { allLinksQuery } = this.props;

    allLinksQuery.subscribeToMore({
      document: gql`
        subscription {
          Link(filter: { mutation_in: [CREATED] }) {
            node {
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
        }
      `,
      updateQuery: (previous, { subscriptionData }) => {
        // Retrive new link from subscription data
        // Similar to a reducer
        const newAllLinks = [
          subscriptionData.data.Link.node,
          ...previous.allLinks
        ];
        // Merge old data with new
        const result = {
          ...previous,
          allLinks: newAllLinks
        };

        return result;
      }
    });
  }

  _subscribeToNewVotes = () => {
    const { allLinksQuery } = this.props;

    allLinksQuery.subscribeToMore({
      document: gql`
        subscription {
          Vote(filter: { mutation_in: [CREATED] }) {
            node {
              id
              link {
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
              user { id }
            }
          }
        }
      `,
      updateQuery: (previous, { subscriptionData }) => {
        const votedLinkIndex = previous.allLinks.findIndex((link) => {
          return link.id === subscriptionData.data.Vote.node.link.id
        });

        const { link } = subscriptionData.data.Vote.node;
        const newAllLinks = previous.allLinks.slice();

        newAllLinks[votedLinkIndex] = link;

        const result = {
          ...previous,
          allLinks: newAllLinks
        };

        return result;
      }
    });
  }

  _getLinksToRender = (isNewPage) => {
    const { allLinksQuery } = this.props;
    if (isNewPage) {
      return allLinksQuery.allLinks;
    }

    const rankedLinks = allLinksQuery.allLinks.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  }

  _nextPage = () => {
    const { match, history, allLinksQuery } = this.props;
    const page = parseInt(match.params.page, 10);
    if (page <= allLinksQuery._allLinksMeta.count / LINKS_PER_PAGE ) {
      const nextPage = page + 1;
      history.push(`/new/${nextPage}`);
    }
  }

  _previousPage = () => {
    const { match, history } = this.props;
    const page = parseInt(match.params.page, 10);
    if (page > 1) {
      const previousPage = page - 1;
      history.push(`/new/${previousPage}`);
    }
  }
}
// skip: offset where query will start
// first: limit, or how many elements, to load from the list
export const ALL_LINKS_QUERY = gql`
  query AllLinksQuery($first: Int, $skip: Int, $orderBy: LinkOrderBy) {
    allLinks(first: $first, skip: $skip, orderBy: $orderBy) {
      id
      createdAt
      url
      description
      postedBy { 
        id 
        name 
      }
      votes { 
        id 
        user { id }
      }
    }
    _allLinksMeta { count }
  }
`;
// allLinksQuery will be injected as a prop into LinkList
// If it was unspecified, it would default to the name 'data'
export default graphql(ALL_LINKS_QUERY, { 
  name: 'allLinksQuery',
  // Uses component props before query is executed
  // Retrieves current page info from the router
  // Use to calculate the links with first and skip
  options: (ownProps) => {
    // Grab current page
    const page = parseInt(ownProps.match.params.page, 10);
    const isNewPage = ownProps.location.pathname.includes('new');
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    // Ensure newest links are displayed first
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    return { 
      variables: { first, skip, orderBy }
    };
  }
})(LinkList);