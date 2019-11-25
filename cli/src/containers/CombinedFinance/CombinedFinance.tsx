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
  }));

export const CombinedFinance: React.FunctionComponent = () => {
  const classes = useStyles()();
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fromDate, setFromDate] = React.useState<Date>(moment().subtract(30, 'days').toDate());
  const [toDate, setToDate] = React.useState<Date>(new Date());
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
            value={fromDate} onChange={(date: Date | null) => { if (date) { setFromDate(date); }}}
            KeyboardButtonProps={{ 'aria-label': 'change date' }}
            disableToolbar
          />
          <KeyboardDatePicker
            variant="inline" format="dd/MM/yyyy" margin="normal" id="date-picker-to" label="To"
            value={toDate} onChange={(date: Date | null) => { if (date) { setToDate(date); }}}
            KeyboardButtonProps={{ 'aria-label': 'change date' }}
            disableToolbar
          />
        </MuiPickersUtilsProvider>
        <div className={classes.btnFilter}>
          <Button onClick={() => fetch()} color="secondary" variant="outlined">
            Filter
          </Button>
        </div>
      </div>
      <RawTransactions loading={loading} transactions={transactions} />
    </div>
  );
};
