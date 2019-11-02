import * as React from 'react';
import {
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Button, MenuItem, TextField, Box,
} from '@material-ui/core';
import { ExportType } from '../constants';
import { useState } from 'react';
import { downloadCombinedFinanceCSV, downloadYnabCSV } from '../actions';
import { TransactionLog } from '../../../api/ynab';
import { List } from 'immutable';
import { useStyles } from '../../../style';
import useTheme from '@material-ui/core/styles/useTheme';

interface IExportProps {
  selectedTransactions: List<boolean>;
  transactions: TransactionLog[];
}

const doExport = (exportType: ExportType, owner: string, selectedTransactions: List<boolean>, transactions: TransactionLog[]) =>
  exportType === ExportType.COMBINED_FINANCE
    ? downloadCombinedFinanceCSV(transactions, selectedTransactions, owner)
    : downloadYnabCSV(transactions, selectedTransactions);

export const Export: React.FunctionComponent<IExportProps> = ({ selectedTransactions, transactions }) => {
  const classes = useStyles(useTheme())();
  const [owner, setOwner] = useState('');
  const [exportType, setExportType] = useState<ExportType>(ExportType.COMBINED_FINANCE);
  const selectedCount = selectedTransactions.filter(v => v).size;

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
                onChange={e => setOwner(e.target.value)}
                helperText="Whose transactions are these?"
                margin="dense"
                variant="outlined"
              >
                {['Mahefa', 'Hasina'].map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
              </TextField>
            </Box>
          ) : null
      }
      <Button
        color="secondary"
        disabled={selectedCount === 0}
        variant="outlined"
        onClick={() => doExport(exportType, owner, selectedTransactions, transactions)}
      >
        Export
      </Button>
    </FormControl>
  );
};
