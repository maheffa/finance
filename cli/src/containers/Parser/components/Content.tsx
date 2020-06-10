import * as React from 'react';
import { useState } from 'react';
import { List } from 'immutable';
import { Table, TableHead, TableRow, TableCell, TableBody, Box, Checkbox, Divider } from '@material-ui/core';
import { TransactionLog } from '../../../api/ynab';
import { useStyles } from '../../../style';
import { Export } from './Export';
import useTheme from '@material-ui/styles/useTheme/useTheme';
import { useTableData } from '../../hooks';
import { v4 as id } from 'uuid';

interface IContentProps {
  transactions: TransactionLog[];
}

interface IdentifiableTransactionLog extends TransactionLog {
  id: string;
}

const stripId = (idTrans: IdentifiableTransactionLog): TransactionLog => {
  // tslint:disable-next-line:no-shadowed-variable
  const { id, ...trans } = idTrans;
  return trans;
};

const usePoolSelect = (ids: string[]): [{[index: string]: boolean }, number, (i: string, v: boolean) => void] => {
  const [idMap, setIdMap] = useState<{[index: string]: boolean }>(ids.reduce((prev, nextId) => ({ ...prev, [nextId]: false }), {}));
  const [idPool, setIdPool] = useState(new Set(ids));

  return [
    idMap,
    (new Array(...idPool)).filter(i => idMap[i]).length,
    (idToSet: string, value: boolean) => {
      setIdPool(idPool.add(idToSet));
      return setIdMap({ ...idMap, [idToSet]: value })
    },
  ];
};

export const Content: React.FunctionComponent<IContentProps> = props => {
  const classes = useStyles(useTheme())();
  const [transactions, setTransactions, setComparator, setFilter] = useTableData<IdentifiableTransactionLog>(
    List(props.transactions.map(transaction => ({ ...transaction, id: id() }))),
    { identifier: t => { console.log('BBB'); return t.id } }
  );
  const [selected, selectedCount, setSelected] = usePoolSelect(transactions.map(t => t.id).toArray());

  return (
    <Box>
      <Divider variant="middle" />
      <Box mb={3} mt={3}>
        <Export transactions={transactions.filter(t => selected[t.id]).map(stripId).toArray()} />
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedCount === transactions.size}
                onChange={() => transactions.forEach(t => setSelected(t.id, selectedCount !== transactions.size))}
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
            <TableRow
              key={row.id}
              className={classes.tableRow}
              onClick={() => setSelected(row.id, !selected[row.id])}
            >
              <TableCell padding="checkbox"><Checkbox checked={selected[row.id]} /></TableCell>
              <TableCell align="center">{row.date[2]}/{row.date[1]}/{row.date[0]}</TableCell>
              <TableCell>{row.payee}</TableCell>
              <TableCell>{row.memo}</TableCell>
              <TableCell align="right" className={classes.inFlow}>{row.inFlow > 0 ? row.inFlow : null}</TableCell>
              <TableCell align="right" className={classes.outFlow}>{row.outFlow > 0 ? row.outFlow : null}</TableCell>
            </TableRow>
          )).toArray()}
        </TableBody>
      </Table>
    </Box>
  );
};
