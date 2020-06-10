import React from 'react';
import { NavLink } from 'react-router-dom';
import { routes } from './constants';

export const AppBar: React.FunctionComponent = () => {
  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <ul className="nav">
          <li className="nav-title">Finance Tool</li>
          <li className="nav-item">
            {
              routes.map(route => (
                <NavLink key={route.path} className="nav-link" exact={route.path === '/'} to={route.path}>{route.title}</NavLink>
              ))
            }
          </li>
        </ul>
      </nav>
      <button className="sidebar-minimizer brand-minimizer" type="button"/>
    </div>
  );
};
