import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import { StylesProvider } from '@material-ui/styles';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Parser } from '../Parser/Parser';
import { AppBar } from './AppBar';

const App: React.FunctionComponent = () => {
  return (
    <BrowserRouter>
      <StylesProvider injectFirst>
        <AppBar/>
        <Container maxWidth="md">
          <Box py={2}>
            <Parser/>
          </Box>
        </Container>
      </StylesProvider>
    </BrowserRouter>
  );
};

export default App;
