import { FunctionComponent } from 'react';
import { Parser } from '../Parser/Parser';
import { CombinedFinance } from '../CombinedFinance/CombinedFinance';
import { Proportions } from '../Poroportions';

export interface IRouteInfo {
  path: string;
  title: string;
  component: FunctionComponent;
  exact?: boolean;
}

export interface IRouteInfos {
  [key: string]: IRouteInfo;
}

export const routes: IRouteInfo[] = [
  {
    path: '/',
    title: 'Converter',
    component: Parser,
    exact: true,
  },
  {
    path: '/transactions',
    title: 'Transactions',
    component: CombinedFinance,
  },
  {
    path: '/proportions',
    title: 'Proportions',
    component: Proportions,
  },
];
