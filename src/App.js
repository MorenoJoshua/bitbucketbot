import React, {Component} from 'react';
import axios from 'axios';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

class App extends Component {
  constructor() {
    super();

    const repos = [
      '==ChangeMe==',
      '==ChangeMe==',
    ];

    const commits = {};
    repos.map(r => commits[r] = []);

    this.state = {
      username: '==ChangeMe==',
      password: '==ChangeMe==',
      repos,
      commits,
      next: {},
    };

    this.getCommits = this.getCommits.bind(this);
    this.auth = `Basic ${btoa(`${this.state.username}:${this.state.password}`)}`;

    this.state.repos.map(repo => this.getCommits(repo));

    setInterval(() => window.location.reload(), 1000 * 60 * 5);
  }

  getCommits(repo) {
    const baseUrl = 'https://api.bitbucket.org/2.0';
    const team = 'orderhero';
    const page = this.state.next[repo] || 1;
    const url = `${baseUrl}/repositories/${team}/${repo}/commits?pagelen=8&page=${page}`;
    if (page > 0) {
      axios.get(url, {headers: {Authorization: this.auth}})
        .then(response => {
            const rr = response.data.values[0].repository;
            const newState = this.state;
            newState.next[rr.name] = response.data.next ? response.data.next.split('=').pop() : -1;
            newState.commits[rr.name].push(...response.data.values);
            this.setState(newState);
          }
        )
    }
  }


  render() {
    return <div className="container bg-dark" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      {Object.keys(this.state.commits).map(repoKey => {
        const repo = this.state.commits[repoKey];
        return <div key={repoKey} style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>

          <div style={{flexGrow: 0}}>
            <h5 className='text-white'>{repoKey} {this.state.next[repoKey] !== -1 && (
              <span className='text-success'
                    onClick={() => this.getCommits(repoKey)}>+</span>)}</h5>
          </div>
          <div style={{flexGrow: 1, overflowY: 'auto',}}>
            <ul className='list-unstyled'>
              {repo.map((commit, i) => {
                return (
                  <li key={i} style={{
                    display: 'flex',
                  }} className='mono'>
                      <span style={{
                        flexGrow: 1
                      }} className='text-truncate'>
                      <span className="text-danger">{commit.hash.substr(0, 6)}</span>&nbsp;
                        <span
                          className="text-success">{commit.author.user.username.substr(0, 7)}</span>&nbsp;
                        <span
                          className={commit.author.user.username !== this.state.username ?
                            'text-muted' : 'text-white'}>{commit.message.split("\r\n")[0]}</span>
                      </span>
                    <span style={{
                      flexGrow: 0,
                      whiteSpace: 'pre',
                      textAlign: 'right'
                    }} className="text-info">{moment(commit.date).fromNow()}</span>
                  </li>
                )
              })
              }
            </ul>
          </div>
        </div>
      })
      }
    </div>;
  }
}

export default App;
