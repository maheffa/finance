import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Parser } from '../Parser/Parser';
import { AppBar } from './AppBar';
import { Route } from 'react-router';
import { CombinedFinance } from '../CombinedFinance/CombinedFinance';
import { routes } from './constants';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { colors, Container, Box } from '@material-ui/core';
import ThemeProvider from '@material-ui/styles/ThemeProvider/ThemeProvider';
import { SnackbarProvider } from 'notistack';

const theme = createMuiTheme({
  palette: {
    primary: colors.lightBlue,
    secondary: colors.lightGreen,
  },
});

export const App: React.FunctionComponent = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <AppBar />
          <Container maxWidth="md">
            <Box py={2}>
              {
                routes.map(route => (
                  <Route exact={route.exact} path={route.path}>
                    {React.createElement(route.component)}
                  </Route>
                ))
              }
            </Box>
          </Container>
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};
