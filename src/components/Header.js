import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

import { GC_AUTH_TOKEN, GC_USER_ID } from '../constants';

class Header extends Component {
  render() {
    const userId = localStorage.getItem(GC_USER_ID);
    const { history } = this.props;

    return (
      <div className='flex pa1 justify-between nowrap orange'>
        <div className='flex flex-fixed black'>
          <div className='fw7 mr1'>
            <Link to='/' className='ml1 no-underline black'>
              Hacker News
            </Link>
          </div>
          <Link to='/' className='ml1 no-underline black'>new</Link>
          <div className='ml1'>|</div>
          <Link to='/search' className='ml1 no-underline black'>search</Link>
          { userId &&
            <div className='flex'>
              <div className='ml1'>|</div>
              <Link to='/create' className='ml1 no-underline black'>submit</Link>
            </div>
          }
        </div>
        <div className='flex flex-fixed'>
          { userId ?
            <div className='ml1 pointer black' onClick={ () => {
              localStorage.removeItem(GC_USER_ID);
              localStorage.removeItem(GC_AUTH_TOKEN);
              history.push('/');
            }}>logout</div>
            :
            <Link to='/login' className='ml1 no-underline black'>login</Link>
          }
        </div>
      </div>
    );
  }
}

export default withRouter(Header);