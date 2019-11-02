import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  MenuItem,
  TextField,
  Box,
} from '@material-ui/core';
import { ExportType } from '../constants';
import { downloadCombinedFinanceCSV, downloadYnabCSV } from '../actions';
import { TransactionLog, User } from '../../../api/ynab';
import { List } from 'immutable';
import { useStyles } from '../../../style';
import useTheme from '@material-ui/core/styles/useTheme';
import { ynabCli } from '../../../api/YnabClient';

interface IExportProps {
  selectedTransactions: List<boolean>;
  transactions: TransactionLog[];
}

const doExport = (exportType: ExportType, owner: string, selectedTransactions: List<boolean>, transactions: TransactionLog[]) =>
  exportType === ExportType.COMBINED_FINANCE
    ? downloadCombinedFinanceCSV(transactions, selectedTransactions, owner)
    : downloadYnabCSV(transactions, selectedTransactions);

const getUserOwner = (owner: number | undefined, users: User[]) => {
  const found = users.find(user => user.id === owner);
  return found ? found.name : '';
};

export const Export: React.FunctionComponent<IExportProps> = ({ selectedTransactions, transactions }) => {
  const classes = useStyles(useTheme())();
  const [users, setUsers] = useState<User[]>([]);
  const [owner, setOwner] = useState<number>();
  const [exportType, setExportType] = useState<ExportType>(ExportType.COMBINED_FINANCE);
  const selectedCount = selectedTransactions.filter(v => v).size;

  useEffect(() => { ynabCli.getUsers().then(setUsers); }, []);

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
                select
                label="Owner"
                value={owner}
                onChange={e => setOwner(parseInt(e.target.value, 10))}
                helperText="Whose transactions are these?"
                margin="dense"
                variant="outlined"
              >
                {
                  users.map(user => <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>)
                }
              </TextField>
            </Box>
          ) : null
      }
      <Button
        color="secondary"
        disabled={selectedCount === 0}
        variant="outlined"
        onClick={() => doExport(exportType, getUserOwner(owner, users) , selectedTransactions, transactions)}
      >
        Export
      </Button>
    </FormControl>
  );
};
