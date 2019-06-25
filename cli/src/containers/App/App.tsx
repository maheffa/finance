import React from 'react';
import {Route, Switch} from 'react-router';
import {BrowserRouter, Link} from 'react-router-dom';
import {CombinedFinance} from '../CombinedFinance/CombinedFinance';
import {Parser} from '../Parser/Parser';

export const Home: React.FunctionComponent = () => <div>This is home</div>;
export const NotFound: React.FunctionComponent = () => <div>Oops</div>;

const App: React.FunctionComponent = () => {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/combined/">Combined</Link>
            </li>
            <li>
              <Link to="/parser/">Parser</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/combined" component={CombinedFinance} />
          <Route path="/parser/" component={Parser} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </BrowserRouter>
  );
};

export default App;
