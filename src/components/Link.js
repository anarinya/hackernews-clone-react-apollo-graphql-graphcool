import React, { Component } from 'react';
import { graphql, gql } from 'react-apollo';
import { GC_USER_ID } from '../constants';
import { timeDifferenceForDate } from '../utils';

class Link extends Component {

  render() {
    const userId = localStorage.getItem(GC_USER_ID);
    const { index, link: { description, url, votes, postedBy, createdAt }} = this.props;
    return (
      <div className='flex mt2 items-start'>
        <div className='flex items-center'>
          <span className='gray'>{ index + 1 }.</span>
          { userId && 
            <div 
              className='ml1 gray f11'
              onClick={ () => this._voteForLink() }>▲</div>
          }
        </div>
        <div className='ml1'>
          <div>{ description } ({ url })</div>
          <div className='f6 lh-copy gray'>
            { votes.length } votes | by { postedBy ? postedBy.name : 'Unknown' }
            &nbsp;{ timeDifferenceForDate(createdAt) }
          </div>
        </div>
      </div>
    );
  }

  _voteForLink = async () => {
    const { link, createVoteMutation, updateStoreAfterVote } = this.props;
    const linkId = link.id;
    const userId = localStorage.getItem(GC_USER_ID);
    const voterIds = link.votes.map(vote => vote.user.id);

    if (voterIds.includes(userId)) {
      console.log(`User (${userId}) already voted for this link.`);
      return;
    }

    await createVoteMutation({
      variables: { userId, linkId },
      update: (store, { data: { createVote } }) => {
        updateStoreAfterVote(store, createVote, linkId);
      }
    });
  }
}

const CREATE_VOTE_MUTATION = gql`
  mutation CreateVoteMutation($userId: ID!, $linkId: ID!) {
    createVote(userId: $userId, linkId: $linkId) {
      id,
      link {
        votes {
          id
          user { id }
        }
      }
      user { id }
    }
  }
`;

export default graphql(
  CREATE_VOTE_MUTATION, 
  { name: 'createVoteMutation' }
)(Link);