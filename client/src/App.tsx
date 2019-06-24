import React from 'react';
import Board from './Board';
import './App.scss';

interface AppProps {
}

interface AppState {
  isLoggedIn: boolean;
  username: string;
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props: any, ...rest: any[]) {
    super(props, ...rest);

    const storedName = localStorage.getItem('username');

    this.state = {
      isLoggedIn: !!storedName,
      username: '',
    }
  }

  handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ username: e.target.value });
  }

  handleLoginClicked() {
    localStorage.setItem('username', this.state.username);
    this.setState({ isLoggedIn: true });
  }

  handleLogoutClicked() {
    localStorage.removeItem('username')
    this.setState({ isLoggedIn: false, username: '' });
  }

  render() {
    return (
      <div className="app-component">
        {!this.state.isLoggedIn && (
          <div className="name-dialog">
            <div className="title">Please enter your name:</div>
            <input className="name-input" type="text" onChange={e => this.handleNameChange(e)} />
            <button className="btn login-btn" onClick={e => this.handleLoginClicked()}>Login</button>
          </div>
        )}
        {this.state.isLoggedIn && (
          <div className="app-main">
            <div className="app-header">
              <button className="btn" onClick={e => this.handleLogoutClicked()}>Logout</button>
            </div>
            <div className="app-central">
              <Board />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;
