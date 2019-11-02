import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ListIcon from '@material-ui/icons/List';
import * as React from 'react';
import { useState } from 'react';
import { Content } from './components/Content';
import { TransactionType } from './constants';
import { TextField, MenuItem, Grid } from '@material-ui/core';
import { TransactionLog } from '../../api/ynab';
import { parseFile } from './actions';
import { FileUpload } from './components/FileUpload';
import CircularProgress from '@material-ui/core/CircularProgress';

export const Index: React.FunctionComponent = () => {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isParsing, setIsParsing] = useState(false);
  const [parsed, setParsed] = useState<TransactionLog[]>([]);
  const [transactionType, setTransactionType] = useState<TransactionType | undefined>(undefined);

  const onParse = () => parseFile(file, transactionType, { setIsParsing, setParsed, setFile });

  return (
    <div>
      <Box mb={3}>
        <FileUpload file={file} setFile={setFile} />
        <Box mt={2} mb={2}>
          <Grid container alignContent="center" justify="space-between">
            <Grid item>
              <TextField
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTransactionType(event.target.value as TransactionType)}
                disabled={file === undefined} value={transactionType}
                helperText="Where did these transactions come from?"
                margin="dense" variant="outlined" label="Source"
                select
              >
                {
                  Object.keys(TransactionType).map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)
                }
              </TextField>
            </Grid>
            <Grid item>
              <Button
                style={{ marginTop: 8 }} onClick={onParse}
                disabled={transactionType === undefined || isParsing} color="primary" variant="outlined"
              >
                Parse { isParsing ?  <CircularProgress variant="indeterminate" disableShrink size={24} /> : <ListIcon /> }
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box>
        { parsed.length > 0 ?  <Content transactions={parsed} /> : null }
      </Box>
    </div>
  );
};
