import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppBar } from './AppBar';
import { Route } from 'react-router';
import { routes } from './constants';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { colors, Container, Box, Modal, TextField } from '@material-ui/core';
import ThemeProvider from '@material-ui/styles/ThemeProvider/ThemeProvider';
import { SnackbarProvider } from 'notistack';
import { useIsAuthorized } from '../hooks';
import { Auth } from './Auth';

const theme = createMuiTheme({
  palette: {
    primary: colors.lightBlue,
    secondary: colors.lightGreen,
  },
});

export const App: React.FunctionComponent = () => {
  const [isAuthorized, setPass] = useIsAuthorized();

  if (!isAuthorized) {
    return <Auth setPass={setPass} />;
  }

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
