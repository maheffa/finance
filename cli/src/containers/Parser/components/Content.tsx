import * as React from 'react';
import { useState } from 'react';
import { List } from 'immutable';
import { Table, TableHead } from '@material-ui/core';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Box from '@material-ui/core/Box';
import useTheme from '@material-ui/core/styles/useTheme';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import { TransactionLog } from '../../../api/ynab';
import { useStyles } from '../../../style';
import { Export } from './Export';

interface IContentProps {
  transactions: TransactionLog[];
}

export const Content: React.FunctionComponent<IContentProps> = ({ transactions }) => {
  const classes = useStyles(useTheme())();
  const nTransactions = transactions.length;
  const [selectedTransactions, selectTransactions] = useState<List<boolean>>(List<boolean>(Array(nTransactions).fill(false)));
  const selectedCount = selectedTransactions.filter(v => v).size;

  return (
    <Box>
      <Divider variant="middle" />
      <Box mb={3} mt={3}>
        <Export transactions={transactions} selectedTransactions={selectedTransactions} />
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedCount === nTransactions}
                onChange={() => selectTransactions(selectedTransactions.map(() => selectedCount !== nTransactions))}
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
