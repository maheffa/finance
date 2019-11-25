import * as React from 'react';
import { useState, useEffect } from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Box, Grid, Button } from '@material-ui/core';
import { ExportType } from '../constants';
import { downloadCombinedFinanceCSV, downloadYnabCSV, importIntoCombined } from '../actions';
import { TransactionLog, User, Transaction } from '../../../api/ynab';
import { List } from 'immutable';
import { useStyles } from '../../../style';
import { ynabCli } from '../../../api/YnabClient';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import useTheme from '@material-ui/styles/useTheme/useTheme';
import { useSnackbar } from 'notistack';

interface IExportProps {
  selectedTransactions: List<boolean>;
  transactions: TransactionLog[];
}

const doExport = (exportType: ExportType, owner: string, selectedTransactions: List<boolean>, transactions: TransactionLog[]) =>
  exportType === ExportType.COMBINED_FINANCE
    ? downloadCombinedFinanceCSV(transactions, selectedTransactions, owner)
    : downloadYnabCSV(transactions, selectedTransactions);

const successMessage = (createdTransactions: Transaction[]) => `Successfully imported ${createdTransactions.length} transactions`;

export const Export: React.FunctionComponent<IExportProps> = ({ selectedTransactions, transactions }) => {
  const classes = useStyles(useTheme())();
  const [users, setUsers] = useState<{ [key: number]: User }>({});
  const [owner, setOwner] = useState<number>();
  const [exportType, setExportType] = useState<ExportType>(ExportType.COMBINED_FINANCE);
  const selectedCount = selectedTransactions.filter(v => v).size;
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    ynabCli.getUsers().then(usersList => {
      setUsers(usersList.reduce((cur, user) => ({ ...cur, [user.id]: user }), {}));
    });
  }, []);

  return (
    <FormControl component="fieldset" className={classes.formControl}>
      <FormLabel component="legend">Export type: </FormLabel>
      <RadioGroup
        className={classes.group}
        value={exportType}
        onChange={e => setExportType((e.target as HTMLInputElement).value as ExportType)}
        row
      >
        <FormControlLabel value={ExportType.COMBINED_FINANCE} control={<Radio/>} label="Combined Finance"/>
        <FormControlLabel value={ExportType.YNAB} control={<Radio/>} label="YNAB"/>
      </RadioGroup>
      {
        exportType === ExportType.COMBINED_FINANCE
          ? (
            <Box mb={2}>
              <TextField
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setOwner(parseInt(event.target.value, 10))}
                value={owner}
                helperText="Whose transactions are these?"
                margin="dense" variant="outlined" label="Owner"
                select
              >
                {
                  Object.keys(users)
                    .map(key => parseInt(key, 10))
                    .map(userId => <MenuItem key={userId} value={userId} >{users[userId].name}</MenuItem>)
                }
              </TextField>
            </Box>
          ) : null
      }
      <Grid container>
        <Grid item>
          <Button
            onClick={() => doExport(exportType, users[owner!].name , selectedTransactions, transactions)}
            disabled={selectedCount === 0}
            color="primary" variant="outlined"
          >
            Export to CSV
          </Button>
        </Grid>
        {
          exportType === ExportType.COMBINED_FINANCE ? (
            <Grid>
              <Button
                onClick={() => importIntoCombined(owner!, selectedTransactions, transactions)
                  .then(res => enqueueSnackbar(successMessage(res), { variant: 'success' }))
                  .catch(() => enqueueSnackbar('Something went wrong. Contact Jesus.', { variant: 'error' }))}
                disabled={selectedCount === 0 || owner === undefined}
                color="secondary" variant="outlined"
              >
                Import as Combined
              </Button>
            </Grid>
          ) : null
        }
      </Grid>
    </FormControl>
  );
};
