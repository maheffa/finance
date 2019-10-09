import React from 'react';
import { Link } from 'react-router-dom';

export const AppBar: React.FunctionComponent<{}> = () => (
  <div className="sidebar">
    <nav className="sidebar-nav">
      <ul className="nav">
        <li className="nav-title">Finance Tool</li>
        <li className="nav-item">
          <Link className="nav-link" to="/">Converter</Link>
        </li>
        {/*<li className="nav-item">*/}
          {/*<a className="nav-link" href="#">*/}
            {/*<i className="nav-icon cui-speedometer"/> With badge*/}
            {/*<span className="badge badge-primary">NEW</span>*/}
          {/*</a>*/}
        {/*</li>*/}
        {/*<li className="nav-item nav-dropdown">*/}
          {/*<a className="nav-link nav-dropdown-toggle" href="#">*/}
            {/*<i className="nav-icon cui-puzzle"/> Nav dropdown*/}
          {/*</a>*/}
          {/*<ul className="nav-dropdown-items">*/}
            {/*<li className="nav-item">*/}
              {/*<a className="nav-link" href="#">*/}
                {/*<i className="nav-icon cui-puzzle"/> Nav dropdown item*/}
              {/*</a>*/}
            {/*</li>*/}
            {/*<li className="nav-item">*/}
              {/*<a className="nav-link" href="#">*/}
                {/*<i className="nav-icon cui-puzzle"/> Nav dropdown item*/}
              {/*</a>*/}
            {/*</li>*/}
          {/*</ul>*/}
        {/*</li>*/}
      </ul>
    </nav>
    <button className="sidebar-minimizer brand-minimizer" type="button"/>
  </div>
);
