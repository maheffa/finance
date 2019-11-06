export interface IRouteInfo {
  path: string;
  title: string;
}

export interface IRouteInfos {
  [key: string]: IRouteInfo;
}

export const routes: IRouteInfos = {
  parser: {
    path: '/',
    title: 'Converter',
  },
  combined: {
    path: '/combined',
    title: 'Combined Budgets',
  },
};
