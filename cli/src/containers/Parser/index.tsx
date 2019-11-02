import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ListIcon from '@material-ui/icons/List';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Content } from './components/Content';
import { TransactionType } from './constants';
import { TextField, MenuItem, Grid } from '@material-ui/core';
import { TransactionLog, User } from '../../api/ynab';
import { parseFile } from './actions';
import { FileUpload } from './components/FileUpload';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ynabCli } from '../../api/YnabClient';
import { ParseController } from './components/ParseController';

export const Index: React.FunctionComponent = () => {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [parsed, setParsed] = useState<TransactionLog[]>([]);




  return (
    <div>
      <Box mb={3}>
        <FileUpload file={file} setFile={setFile} />
        <ParseController setFile={setFile} file={file} setParsed={setParsed} />
      </Box>
      <Box>
        { parsed.length > 0 ?  <Content transactions={parsed} /> : null }
      </Box>
    </div>
  );
};
