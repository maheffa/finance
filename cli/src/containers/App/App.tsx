import React, { useState, ChangeEvent } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Parser } from '../Parser/Parser';
import { AppBar } from './AppBar';
import { Route } from 'react-router';
import { CombinedFinance } from '../CombinedFinance/CombinedFinance';
import { routes } from './constants';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { colors, Slide, TextField, Dialog, Button, Container, Box, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import ThemeProvider from '@material-ui/styles/ThemeProvider/ThemeProvider';
import { SnackbarProvider } from 'notistack';
import { ynabCli } from '../../api/YnabClient';
import { TransitionProps } from '@material-ui/core/transitions';

const theme = createMuiTheme({
  palette: {
    primary: colors.lightBlue,
    secondary: colors.lightGreen,
  },
});

const Transition = React.forwardRef<unknown, TransitionProps>((props: TransitionProps, ref: React.Ref<unknown>) =>
  <Slide direction="up" ref={ref} {...props} />
);

const Login: React.FunctionComponent<{ validatePassword: (password: string) => void, isOpen: boolean }> = props => {
  const [pass, setPass] = useState('');
  return (
    <Dialog fullScreen open={props.isOpen} TransitionComponent={Transition}>
      <DialogTitle id="form-dialog-title">Login</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter password to go further
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="pass"
          label="Password"
          type="password"
          value={pass}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPass(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.validatePassword(pass)} color="primary">
          Subscribe
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const App: React.FunctionComponent = () => {
  const [requiresLogin, setRequiresLogin] = useState<boolean>(true);
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <AppBar routes={routes} />
          <Container maxWidth="md">
            {/*<Login validatePassword={password => ynabCli.auth({ password })} isOpen={requiresLogin} />*/}
            <Box py={2}>
              <Route exact path={routes.parser.path}>
                <Parser />
              </Route>
              <Route path={routes.combined.path}>
                <CombinedFinance />
              </Route>
            </Box>
          </Container>
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};
