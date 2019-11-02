import * as React from 'react';
import { TransactionType } from '../constants';
import ListIcon from '@material-ui/icons/List';
import { Box, Grid, TextField, Button, MenuItem, CircularProgress } from '@material-ui/core';
import { parseFile } from '../actions';
import { useState } from 'react';
import { TransactionLog } from '../../../api/ynab';

interface IParseControllerProps {
  file: File | undefined;
  setFile: (file: File | undefined) => void;
  setParsed: (logs: TransactionLog[]) => void;
}

export const ParseController: React.FunctionComponent<IParseControllerProps> = ({ file, setParsed, setFile }) => {
  const [transactionType, setTransactionType] = useState<TransactionType | undefined>(undefined);
  const [isParsing, setIsParsing] = useState(false);
  const actions = { setIsParsing, setParsed, setFile };

  const onParse = () => parseFile(file, transactionType, actions);

  return (
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
  );
};
