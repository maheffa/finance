import React from 'react';
import { NavLink } from 'react-router-dom';
import { IRouteInfos, IRouteInfo } from './constants';

export const AppBar: React.FunctionComponent<{ routes: IRouteInfos }> = ({ routes }) => {
  const rInfos: IRouteInfo[] = (Object.keys(routes).map(key => routes[key]));
  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <ul className="nav">
          <li className="nav-title">Finance Tool</li>
          <li className="nav-item">
            {
              rInfos.map(rInfo => (
                <NavLink className="nav-link" exact={rInfo.path === '/'} to={rInfo.path}>{rInfo.title}</NavLink>
              ))
            }
          </li>
        </ul>
      </nav>
      <button className="sidebar-minimizer brand-minimizer" type="button"/>
    </div>
  );
};
