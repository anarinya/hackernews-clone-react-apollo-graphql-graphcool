import React, { Component } from 'react';
import { graphql, gql, compose } from 'react-apollo';

import { GC_USER_ID, GC_AUTH_TOKEN } from '../constants';

class Login extends Component {

  state = {
    login: true,
    email: '',
    password: '',
    name: ''
  };

  _confirm = async () => {
    const { name, email, password, login } = this.state;
    const { signinUserMutation, createUserMutation, history } = this.props;

    if (login) {
      const result = await signinUserMutation({
        variables: { email, password }
      });

      const { id } = result.data.signinUser.user;
      const { token } = result.data.signinUser;

      this._saveUserData(id, token);
    } else {
      const result = await createUserMutation({
        variables: { name, email, password }
      });
      const { id } = result.data.signinUser.user;
      const { token } = result.data.signinUser;

      this._saveUserData(id, token);
    }
    history.push('/');
  }

  _saveUserData = (id, token) => {
    localStorage.setItem(GC_USER_ID, id);
    localStorage.setItem(GC_AUTH_TOKEN, token);
  }

  render() {
    const { login, name, password, email } = this.state;

    return (
      <div>
        <h4 className='mv3'>{ login ? 'Login' : 'Sign Up' }</h4>
        <div className='flex flex-column'>
          { !login &&
            <input 
              value={ name }
              onChange={ (e) => this.setState({ name: e.target.value })}
              type='text'
              placeholder='Your name'
            /> 
          }
            <input 
              value={ email }
              onChange={ (e) => this.setState({ email: e.target.value })}
              type='text'
              placeholder='Your email address'
            />
            <input 
              value={ password }
              onChange={ (e) => this.setState({ password: e.target.value })}
              type='password'
              placeholder='Choose a safe password'
            />
        </div>
        <div className='flex mt3'>
          <div 
            className='pointer mr2 button'
            onClick={ () => this._confirm() }
          >
            { login ? 'login' : 'create account' }
          </div>
          <div 
           className='pointer button'
           onClick={ () => this.setState({ login: ! login })}
          >
            { login ? 'need to create an account?' : 'already have an account?' }
          </div>
        </div>
      </div>
    );
  }
}
// Defines create user mutation and then signs in user after creation
const CREATE_USER_MUTATION = gql`
  mutation CreateUserMutation($name: String!, $email: String!, $password: String!) {
    createUser(
      name: $name,
      authProvider: {
        email: {
          email: $email,
          password: $password
        }
      }
    ) { id }

    signinUser(email: { email: $email, password: $password }) {
      token
      user { id }
    }
  }
`;

const SIGNIN_USER_MUTATION = gql`
  mutation SigninUserMutation($email: String!, $password: String!) {
    signinUser(email: {
      email: $email,
      password: $password
    }) {
      token
      user { id }
    }
  }
`;

export default compose(
  graphql(CREATE_USER_MUTATION, { name: 'createUserMutation' }),
  graphql(SIGNIN_USER_MUTATION, { name: 'signinUserMutation' })
)(Login);