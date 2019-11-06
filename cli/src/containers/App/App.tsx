import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import { StylesProvider } from '@material-ui/styles';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Parser } from '../Parser/Parser';
import { AppBar } from './AppBar';
import { Route } from 'react-router';
import { CombinedFinance } from '../CombinedFinance/CombinedFinance';
import { routes } from './constants';

export const App: React.FunctionComponent = () => {
  return (
    <BrowserRouter>
      <StylesProvider injectFirst>
        <AppBar routes={routes} />
        <Container maxWidth="md">
          <Box py={2}>
            <Route exact path={routes.parser.path}>
              <Parser />
            </Route>
            <Route path={routes.combined.path}>
              <CombinedFinance data="wazzaa" />
            </Route>
          </Box>
        </Container>
      </StylesProvider>
    </BrowserRouter>
  );
};
