import * as React from 'react';
import { useEffect, useState } from 'react';
import { ynabCli } from '../../api/YnabClient';
import { Transaction } from '../../api/ynab';
import { Typography, Button } from '@material-ui/core';
import createStyles from '@material-ui/styles/createStyles/createStyles';
import makeStyles from '@material-ui/styles/makeStyles/makeStyles';
import { RawTransactions } from './RawTransactions';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { ChartTransactions } from './ChartTransactions';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton/ToggleButton';
import { Map } from 'immutable';
import { useUrlTimeRange } from '../hooks';

enum ViewType {
  RAW = 'RAW',
  MONTHLY = 'MONTHLY',
  PIE = 'PIE',
}

const useStyles = () => makeStyles(
  createStyles({
    root: {
      width: '100%',
    },
    dateFilter: {
      display: 'flex',
      alignItems: 'center',
    },
    btnFilter: {
      marginTop: '16px',
      marginLeft: '8px',
    },
    toggleContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  })
);

export const CombinedFinance: React.FunctionComponent = () => {
  const classes = useStyles()();
  const [loading, setLoading] = useState<boolean>(false);
  const [timeRange, setTimeRangeFrom, setTimeRangeTo] = useUrlTimeRange(90);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [viewType, setViewType] = useState<ViewType>(ViewType.RAW);

  const fetch = () => {
    setLoading(true);
    ynabCli
      .allTransaction({ from: timeRange.fromFormatted, to: timeRange.toFormatted })
      .then(setTransactions)
      .finally(() => setLoading(false));
  };

  useEffect(() => fetch(), []);

  const replaceTransactions = (updatedTransactions: Transaction[]) => {
    const transMap = updatedTransactions.reduce((curMap, trans) => curMap.set(trans.id, trans), Map<number, Transaction>());
    setTransactions(transactions.map(trans => transMap.get(trans.id) || trans));
  };

  return (
    <div className={classes.root}>
      <Typography variant="h3" gutterBottom>
        Combined Transactions
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Imported via the parser tool.
      </Typography>
      <div className={classes.dateFilter}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            variant="inline" format="dd/MM/yyyy" margin="normal" id="date-picker-from" label="From"
            value={timeRange.from} onChange={setTimeRangeFrom}
            KeyboardButtonProps={{ 'aria-label': 'change date' }}
            autoOk
            disableToolbar
          />
          <KeyboardDatePicker
            variant="inline" format="dd/MM/yyyy" margin="normal" id="date-picker-to" label="To"
            value={timeRange.to} onChange={setTimeRangeTo}
            KeyboardButtonProps={{ 'aria-label': 'change date' }}
            autoOk
            disableToolbar
          />
        </MuiPickersUtilsProvider>
        <div className={classes.btnFilter}>
          <Button onClick={() => fetch()} color="primary" variant="outlined">
            Show
          </Button>
        </div>
        <div className={`${classes.toggleContainer} ${classes.btnFilter}`}>
          <ToggleButtonGroup value={viewType} onChange={(_: any, value: ViewType) => setViewType(value || viewType)} exclusive>
            <ToggleButton value={ViewType.RAW}>raw</ToggleButton>
            <ToggleButton value={ViewType.MONTHLY}>monthly</ToggleButton>
            <ToggleButton value={ViewType.PIE} disabled>pie</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>
      {
        viewType === ViewType.RAW
          ? <RawTransactions loading={loading} transactions={transactions} replaceTransactions={replaceTransactions} />
          : <ChartTransactions loading={loading} transactions={transactions} />
      }
    </div>
  );
};
