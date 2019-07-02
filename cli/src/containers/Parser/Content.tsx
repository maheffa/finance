import * as React from 'react';
import {useState} from 'react';
import {List} from 'immutable';
import {ITransactionLog} from '../../Models/ApiClient';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Box from '@material-ui/core/Box';
import useTheme from '@material-ui/core/styles/useTheme';
import makeStyles from '@material-ui/styles/makeStyles/makeStyles';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import {ExportType, downloadCombinedFinanceCSV, downloadYnabCSV} from './actions';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import {Theme} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

interface IContentProps {
  transactions: ITransactionLog[];
  exportTransactions: (transactions: List<ITransactionLog>) => void;
  toExportTransactions: List<ITransactionLog>;
  setExportType: (type: ExportType) => void;
  exportType: ExportType;
}

const useStyles = (theme: Theme) => makeStyles({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing(3),
    marginBottom: theme.spacing(5),
  },
  group: {
    margin: theme.spacing(1, 0),
  },
  inFlow: {
    color: `${theme.palette.primary.main} !important`,
  },
  outFlow: {
    color: `${theme.palette.error.light} !important`,
  },
});

export const Content: React.FunctionComponent<IContentProps> =
  ({ transactions, exportTransactions, setExportType, exportType }) => {
    const classes = useStyles(useTheme())();
    const nTransactions = transactions.length;
    const [selectedTransactions, selectTransactions] = useState<List<boolean>>(
      List<boolean>(Array(nTransactions).fill(false))
    );
    const [owner, setOwner] = useState('');
    const selectedCount = selectedTransactions.filter(v => v).size;
    const handleExportTypeChange = (event: React.ChangeEvent<unknown>) => {
      setExportType((event.target as HTMLInputElement).value as ExportType);
    };
    const onExport = () => exportType === ExportType.COMBINED_FINANCE
      ? downloadCombinedFinanceCSV(transactions, selectedTransactions, owner)
      : downloadYnabCSV(transactions, selectedTransactions);

    return (
      <Box>
        <Divider variant="middle" />
        <Box mb={3} mt={3}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Export type: </FormLabel>
            <RadioGroup
              aria-label="Gender"
              name="gender1"
              className={classes.group}
              value={exportType}
              onChange={handleExportTypeChange}
              row
            >
              <FormControlLabel value={ExportType.COMBINED_FINANCE} control={<Radio />} label="Combined Finance" />
              <FormControlLabel value={ExportType.YNAB} control={<Radio />} label="YNAB" />
            </RadioGroup>
            {
              exportType === ExportType.COMBINED_FINANCE
                ? (
                  <Box mb={2}>
                    <TextField
                      select
                      label="Owner"
                      value={owner}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setOwner(event.target.value)}
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
              onClick={() => onExport()}
            >
              Export
            </Button>
          </FormControl>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedCount === nTransactions}
                  onChange={() => selectTransactions(selectedTransactions.map(() => selectedCount !== nTransactions))}
                  inputProps={{ 'aria-label': 'Select all desserts' }}
                />
              </TableCell>
              <TableCell align="center">Date</TableCell>
              <TableCell>Payee</TableCell>
              <TableCell>Memo</TableCell>
              <TableCell align="right">Inflow</TableCell>
              <TableCell align="right">Outflow</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((row, index) => (
              <TableRow key={index}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedTransactions.get(index)}
                    onChange={() => selectTransactions(selectedTransactions.update(index, v => !v))}
                  />
                </TableCell>
                <TableCell align="center">{row.date[2]}/{row.date[1]}/{row.date[0]}</TableCell>
                <TableCell>{row.payee}</TableCell>
                <TableCell>{row.memo}</TableCell>
                <TableCell align="right" className={classes.inFlow}>{row.inFlow > 0 ? row.inFlow : null}</TableCell>
                <TableCell align="right" className={classes.outFlow}>{row.outFlow > 0 ? row.outFlow : null}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };
