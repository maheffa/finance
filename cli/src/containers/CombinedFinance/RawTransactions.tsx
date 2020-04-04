import * as React from 'react';
import { useState } from 'react';
import { Transaction } from '../../api/ynab';
import { IconButton, Paper, Table, TableRow, TableBody, TableHead, TableCell, LinearProgress, Theme, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import { TransactionGrouping, groupKey, groupName } from './util';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';
import { EditTransactionModal } from './EditTransactionModal';

const useStyles = makeStyles((theme: Theme) =>
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
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
  }));

interface IRawTransactions {
  loading: boolean;
  transactions: Transaction[];
  replaceTransactions: (transactions: Transaction[]) => void;
}

interface IFilterProps {
  transactions: Transaction[];
  by: TransactionGrouping;
  onChoice: (value: string) => void;
}
const Filter: React.FunctionComponent<IFilterProps> = (props: IFilterProps) => {
  const classes = useStyles();
  const [selected, setSelected] = useState<string>('');
  const handleChange: SelectInputProps['onChange'] = e => {
    if (e.target.value !== undefined) {
      const value = e.target.value as string || '';
      setSelected(value);
      props.onChoice(value);
    }
  };
  const options = new Set(props.transactions.map(t => groupKey[props.by](t)));
  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="demo-simple-select-helper-label">{groupName[props.by]}</InputLabel>
      <Select value={selected} onChange={handleChange}>
        <MenuItem value="" key=""><em>None</em></MenuItem>
        {[...options].map(value => <MenuItem value={value}>{value}</MenuItem>)}
      </Select>
    </FormControl>
  );
};

export const RawTransactions: React.FunctionComponent<IRawTransactions> = ({ loading, transactions, replaceTransactions }) => {
  const classes = useStyles();
  const [payeeFilter, setPayeeFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const visibleTransactions = transactions
    .filter((t: Transaction) => payeeFilter !== '' ? (groupKey[TransactionGrouping.BY_PAYEE](t) === payeeFilter) : true)
    .filter((t: Transaction) => userFilter !== '' ? (groupKey[TransactionGrouping.BY_USER](t) === userFilter) : true)
    .filter((t: Transaction) => categoryFilter !== '' ? (groupKey[TransactionGrouping.BY_MEMO](t) === categoryFilter) : true);

  const [editTransaction, setEditTransaction] = useState<Transaction | undefined>(undefined);

  return (
    <div>
      {
        loading
          ? <LinearProgress/>
          : (
            <Paper className={classes.paper}>
              <Filter transactions={transactions} by={TransactionGrouping.BY_MEMO} onChoice={setCategoryFilter} />
              <Filter transactions={transactions} by={TransactionGrouping.BY_PAYEE} onChoice={setPayeeFilter} />
              <Filter transactions={transactions} by={TransactionGrouping.BY_USER} onChoice={setUserFilter} />
              <EditTransactionModal transaction={editTransaction} onClose={() => setEditTransaction(undefined)} onSaved={trans => replaceTransactions([trans])} />
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Payee</TableCell>
                    <TableCell>Memo</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleTransactions.map((transaction: Transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date[2].toString().padStart(2, '0')}/{transaction.date[1].toString().padStart(2, '0')}/{transaction.date[0]}</TableCell>
                      <TableCell>{transaction.user.name}</TableCell>
                      <TableCell>{transaction.payee.name}</TableCell>
                      <TableCell>{transaction.memo}</TableCell>
                      <TableCell align="right">{transaction.amount}</TableCell>
                      <TableCell><IconButton onClick={() => setEditTransaction(transaction)}><EditIcon /></IconButton></TableCell>
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
