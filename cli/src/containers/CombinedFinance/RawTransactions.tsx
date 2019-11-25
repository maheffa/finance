import * as React from 'react';
import { Transaction } from '../../api/ynab';
import { Paper, Table, TableRow, TableBody, TableHead, TableCell, LinearProgress, Theme } from '@material-ui/core';
import useTheme from '@material-ui/styles/useTheme/useTheme';
import makeStyles from '@material-ui/styles/makeStyles/makeStyles';
import createStyles from '@material-ui/styles/createStyles/createStyles';

const useStyles = (theme: Theme) => makeStyles(
  createStyles({
    root: {
      width: '100%',
    },
    paper: {
      marginTop: theme.spacing(3),
      width: '100%',
      overflowX: 'auto',
      marginBottom: theme.spacing(2),
      backgroundColor: theme.palette.background.default,
    },
    table: {
      minWidth: 650,
    },
  }));

interface IRawTransactions {
  loading: boolean;
  transactions: Transaction[];
}
export const RawTransactions: React.FunctionComponent<IRawTransactions> = ({ loading, transactions }) => {
  const classes = useStyles(useTheme())();
  return (
    <div>
      {
        loading
          ? <LinearProgress/>
          : (
            <Paper className={classes.paper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Payee</TableCell>
                    <TableCell>Memo</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction: Transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date[2].toString().padStart(2, '0')}/{transaction.date[1].toString().padStart(2, '0')}/{transaction.date[0]}</TableCell>
                      <TableCell>{transaction.user.name}</TableCell>
                      <TableCell>{transaction.payee.name}</TableCell>
                      <TableCell>{transaction.memo}</TableCell>
                      <TableCell align="right">{transaction.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )
      }
    </div>
  );
};
