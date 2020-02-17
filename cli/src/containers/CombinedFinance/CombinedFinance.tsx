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
import moment from 'moment';
import { DATE_FORMAT } from '../../constants';
import { ChartTransactions } from './ChartTransactions';
import { useQueryParam, DateParam } from 'use-query-params';
import { TransactionGrouping } from './util';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton/ToggleButton';

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
  const [queryFrom, setQueryFrom] = useQueryParam('from', DateParam);
  const [queryTo, setQueryTo] = useQueryParam('to', DateParam);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fromDate, setFromDate] = useState<Date>(queryFrom || moment().subtract(30, 'days').toDate());
  const [toDate, setToDate] = useState<Date>(queryTo || new Date());
  const [viewType, setViewType] = useState<ViewType>(ViewType.RAW);
  useEffect(() => {
    setLoading(true);
    ynabCli.allTransaction().then(setTransactions).finally(() => setLoading(false));
  }, []);

  const fetch = () => {
    setLoading(true);
    const from = moment(fromDate).format(DATE_FORMAT);
    const to = moment(toDate).format(DATE_FORMAT);
    ynabCli.allTransaction({ from, to }).then(setTransactions).finally(() => setLoading(false));
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
            value={fromDate} onChange={(date: Date | null) => { if (date) { setFromDate(date); setQueryFrom(date); }}}
            KeyboardButtonProps={{ 'aria-label': 'change date' }}
            disableToolbar
          />
          <KeyboardDatePicker
            variant="inline" format="dd/MM/yyyy" margin="normal" id="date-picker-to" label="To"
            value={toDate} onChange={(date: Date | null) => { if (date) { setToDate(date); setQueryTo(date); }}}
            KeyboardButtonProps={{ 'aria-label': 'change date' }}
            disableToolbar
          />
        </MuiPickersUtilsProvider>
        <div className={classes.btnFilter}>
          <Button onClick={() => fetch()} color="secondary" variant="outlined">
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
          ? <RawTransactions loading={loading} transactions={transactions} />
          : <ChartTransactions loading={loading} transactions={transactions} />
      }
    </div>
  );
};
