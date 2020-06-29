import * as React from 'react';
import { useState } from 'react';
import { Transaction } from '../../api/ynab';
import {
  IconButton,
  Paper,
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  LinearProgress,
  Theme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel,
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import { TransactionGrouping, groupKey, groupName } from './util';
import { SelectInputProps } from '@material-ui/core/Select/SelectInput';
import { EditTransactionModal } from './EditTransactionModal';
import { SortDirection } from '@material-ui/core/TableCell';
import moment, { Moment } from 'moment';

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
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
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

type SortableKey = keyof Omit<Transaction, 'memo' | 'id' | 'created'>;
const isSortableKey = (key: keyof Transaction): key is SortableKey => ['memo', 'id', 'created'].indexOf(key) === -1;
const comparators: Record<SortableKey, (t1: IMomentTransaction, t2: IMomentTransaction) => number> = {
  amount: (t1, t2) => t1.amount - t2.amount,
  date: (t1, t2) => t1.dateMoment.isBefore(t2.dateMoment) ? -1 : 1,
  payee: (t1, t2) => t1.payee.name < t2.payee.name ? -1 : 1,
  user: (t1, t2) => t1.user.name < t2.user.name ? -1 : 1,
};

const headcells: [keyof Transaction, string, undefined | 'right'][] = [
  ['date', 'Date', undefined],
  ['user', 'User', undefined],
  ['payee', 'Payee', undefined],
  ['memo', 'Memo', undefined],
  ['amount', 'Amount', 'right'],
];

const useSortState = () => {
  const [order, setOrder] = useState<SortDirection>(false);
  const [orderBy, setOrderBy] = useState<SortableKey | undefined>(undefined);
  const toggleOn = (key: SortableKey | undefined) => {
    if (key === undefined) {
      setOrder(false);
      setOrderBy(undefined);
    } else {
      if (key === orderBy) {
        setOrder(order === false || order === 'desc' ? 'asc' : 'desc');
      } else {
        setOrder('asc');
        setOrderBy(key);
      }
    }
  };

  return { order, orderBy, toggleOn };
};

interface IMomentTransaction extends Transaction {
  dateMoment: Moment;
}

export const RawTransactions: React.FunctionComponent<IRawTransactions> = ({ loading, transactions, replaceTransactions }) => {
  const classes = useStyles();
  const [payeeFilter, setPayeeFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const { order, orderBy, toggleOn } = useSortState();
  const visibleTransactions = transactions
    .filter((t: Transaction) => payeeFilter !== '' ? (groupKey[TransactionGrouping.BY_PAYEE](t) === payeeFilter) : true)
    .filter((t: Transaction) => userFilter !== '' ? (groupKey[TransactionGrouping.BY_USER](t) === userFilter) : true)
    .filter((t: Transaction) => categoryFilter !== '' ? (groupKey[TransactionGrouping.BY_MEMO](t) === categoryFilter) : true)
    .map((t: Transaction): IMomentTransaction => ({ ...t, dateMoment: moment([t.date[0], t.date[1] - 1, t.date[2]]) }));
  const sortedTransactions = order !== false && orderBy !== undefined
    ? visibleTransactions.sort((t1, t2) => comparators[orderBy](t1, t2) * (order === 'asc' ? 1 : -1))
    : visibleTransactions;

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
              <EditTransactionModal
                transaction={editTransaction}
                onClose={() => setEditTransaction(undefined)}
                onSaved={trans => replaceTransactions([trans])}
                onDeleted={() => ({})}
              />
              <Table className={classes.table} size="small">
                <TableHead>
                  <TableRow>
                    {headcells.map(([ key, name, align ]) => (
                      <TableCell key={key} align={align} sortDirection={orderBy === key ? order : false}>
                        {
                          isSortableKey(key) ? (
                            <TableSortLabel
                              active={orderBy === key}
                              direction={order || 'asc'}
                              onClick={() => toggleOn(key)}
                            >
                              {name}
                              {orderBy === key
                                ? <span className={classes.visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</span>
                                : null}
                            </TableSortLabel>
                          ) : name
                        }
                      </TableCell>
                    ))}
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedTransactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      {/*<TableCell>{transaction.date[2].toString().padStart(2, '0')}/{transaction.date[1].toString().padStart(2, '0')}/{transaction.date[0]}</TableCell>*/}
                      <TableCell>{transaction.dateMoment.format('DD MMM, YYYY')}</TableCell>
                      <TableCell>{transaction.user.name}</TableCell>
                      <TableCell>{transaction.payee.name}</TableCell>
                      <TableCell>{transaction.memo}</TableCell>
                      <TableCell align="right">{-transaction.amount.toFixed(2)}</TableCell>
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
