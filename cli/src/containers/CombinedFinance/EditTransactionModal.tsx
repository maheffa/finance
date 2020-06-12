import * as React from 'react';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { Transaction, User, TransactionUpdateRequest } from '../../api/ynab';
import { Dialog, DialogTitle, DialogContent, MenuItem, DialogActions, Button, TextField } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { ynabCli } from '../../api/YnabClient';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DATE_FORMAT } from '../../constants';
import DateFnsUtils from '@date-io/date-fns';

interface IEditTransactionModalProps {
  transaction?: Transaction;
  onClose: () => void;
  onSaved: (savedTransaction: Transaction) => void;
  onDeleted: (id: number) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    input: {
      margin: theme.spacing(1),
    },
    delete: {
      marginRight: theme.spacing(6),
    },
    dateWrapper: {
      marginTop: 8,
    },
  })
);

export const EditTransactionModal: React.FunctionComponent<IEditTransactionModalProps> = ({ transaction, onClose, onSaved, onDeleted }) => {
  const styles = useStyles();
  const [users, setUsers] = useState<User[]>([]);
  const [transactionUpdate, setTransactionUpdate] = useState<TransactionUpdateRequest>({
    id: 0, userId: 0, date: [0, 0, 0], payee: '', memo: '', amount: 0,
  });

  const handleClose = () => {
    setTransactionUpdate({ id: 0, userId: 0, date: [0, 0, 0], payee: '', memo: '', amount: 0 });
    onClose();
  };

  const handleSave = () => {
    ynabCli
      .updateTransaction({ transactions: [transactionUpdate] })
      .then(res => onSaved(res[0]))
      .then(onClose);
  };

  const handleDelete = () => {
    ynabCli
      .deleteTransaction({ transactions: [transactionUpdate.id] })
      .then(res => onDeleted(res[0]))
      .then(onClose);
  };

  useEffect(() => {
    if (users.length === 0) {
      ynabCli.getUsers().then(setUsers);
    }
    if (transaction) {
      setTransactionUpdate({
        id: transaction.id,
        userId: transaction.user.id,
        date: transaction.date.slice(0, 3) as [number, number, number],
        payee: transaction.payee.name,
        memo: transaction.memo,
        amount: transaction.amount,
      });
    }
  }, [transaction]);

  return (
    <Dialog open={!!transaction} onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Edit transaction - {transaction?.id}</DialogTitle>
      <DialogContent>
        <TextField
          className={styles.input}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTransactionUpdate({ ...transactionUpdate, userId: parseInt(event.target.value, 10) })}
          value={transactionUpdate.userId}
          label="User"
          select
        >
          {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
        </TextField>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            className={styles.dateWrapper}
            variant="inline" format="dd/MM/yyyy" margin="normal" id="date-picker-from" label="From"
            value={moment([transactionUpdate.date[0], transactionUpdate.date[1] - 1, transactionUpdate.date[2]]).format(DATE_FORMAT)}
            onChange={(val: Date | null) => {
              if (val !== null) {
                setTransactionUpdate({ ...transactionUpdate, date: [val.getFullYear(), val.getMonth() + 1, val.getDate()] })
              }
            }}
            KeyboardButtonProps={{ 'aria-label': 'change date' }}
            autoOk
            disableToolbar
          />
        </MuiPickersUtilsProvider>
        <TextField
          className={styles.input}
          label="Payee"
          type="text"
          value={transactionUpdate.payee}
          onChange={e => setTransactionUpdate({ ...transactionUpdate, payee: e.target.value })}
        />
        <TextField
          className={styles.input}
          label="Memo"
          type="text"
          value={transactionUpdate.memo}
          onChange={e => setTransactionUpdate({ ...transactionUpdate, memo: e.target.value })}
        />
        <TextField
          className={styles.input}
          label="Amount"
          type="number"
          value={transactionUpdate.amount}
          onChange={e => setTransactionUpdate({ ...transactionUpdate, amount: e.target.value as unknown as number })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" variant="outlined" className={styles.delete}>
          Delete
        </Button>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
