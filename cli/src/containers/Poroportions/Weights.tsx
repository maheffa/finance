import * as React from 'react';
import { useEffect, useState } from 'react';
import { Proportion, RequestAction, User } from '../../api/ynab';
import { ynabCli } from '../../api/YnabClient';
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  DialogActions,
  Dialog,
  FormControl,
  InputLabel,
  Select,
  makeStyles,
  createStyles,
  Theme, Typography, IconButton,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles((theme: Theme) => createStyles({
  modalError: {
    color: 'red',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  createButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const UpdateWeightModal: React.FunctionComponent<{ isOpen: boolean, closeModal: () => void, proportion?: Proportion, onDone: () => void }> = ({ isOpen, closeModal, proportion, onDone }) => {
  const styles = useStyles();
  const [users, setUsers] = useState<User[]>([]);
  const [toRequest, setToRequest] = useState<Partial<Proportion>>(proportion || {});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    ynabCli.getUsers().then(setUsers);
    setToRequest(proportion || {})
  }, [proportion]);

  const handleAction = (doDelete: boolean = false) => {
    setError('');
    if (doDelete) {
      if (proportion) {
        ynabCli.proportionActionRequest({
          proportions: [proportion],
          actionType: 'DELETE',
        }).then(() => {
          onDone();
          closeModal();
        });
      }
    } else {
      if (!toRequest.user) { setError('No user is set'); }
      else if (!toRequest.month) { setError('Month not selected'); }
      else if (!toRequest.year) { setError('Year not selected'); }
      else if (!toRequest.amount) { setError('No Amount selected'); }
      else {
        // @ts-ignore
        ynabCli.proportionActionRequest({ proportions: [toRequest], actionType: proportion ? 'UPDATE' : 'CREATE' }).then(() => {
          onDone();
          closeModal();
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => closeModal()}>
      <DialogTitle>{proportion ? 'Edit' : 'Create'} weight</DialogTitle>
      <DialogContent>
        <div>
          <FormControl className={styles.formControl}>
            <InputLabel>User</InputLabel>
            <Select value={toRequest.user?.id} onChange={e => setToRequest({ ...toRequest, user: users.find(u => u.id === e.target.value)})}>
              {users.map(u => <MenuItem value={u.id}>{u.name}</MenuItem>)}
            </Select>
          </FormControl>
        </div>
        <div>
          <FormControl className={styles.formControl}>
            <InputLabel>Month</InputLabel>
            <Select value={toRequest.month} onChange={e => setToRequest({ ...toRequest, month: e.target.value as number })}>
              {Array(12).fill(0).map((_, i) => <MenuItem value={i + 1}>{i < 9 ? `0${i + 1}` : (i + 1)}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl className={styles.formControl}>
            <InputLabel>Year</InputLabel>
            <Select value={toRequest.year} onChange={e => setToRequest({ ...toRequest, year: e.target.value as number })}>
              {Array(10).fill(0).map((_, i) => <MenuItem value={2015 + i}>{2015 + i}</MenuItem>)}
            </Select>
          </FormControl>
        </div>
        <div>
          <FormControl className={styles.formControl}>
            <TextField
              label="Amount"
              type="number"
              value={toRequest.amount}
              onChange={e => setToRequest({ ...toRequest, amount: e.target.value as unknown as number })}
            />
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <div>
          {error ? <Typography color="error">{error}</Typography> : null}
        </div>
        <Button onClick={() => handleAction(true)} color="secondary" variant="outlined" disabled={!proportion}>Delete</Button>
        <Button onClick={() => closeModal()} color="primary">Cancel</Button>
        <Button onClick={() => handleAction()} color="primary" variant="contained">{proportion ? 'Update' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  )
};

export const Weights: React.FunctionComponent = () => {
  const styles = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [proportions, setProportions] = useState<Proportion[]>([]);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [weightOnEdit, setWeightOnEdit] = useState<Proportion | undefined>(undefined);
  const fetch = () => {
    setLoading(true);
    ynabCli.readProportions().then(res => setProportions(res)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div>
      <Button
        variant="contained"
        onClick={() => {setWeightOnEdit(undefined); setEditModalOpen(true); }}
        className={styles.createButton}
      >Add Weight</Button>
      <UpdateWeightModal
        isOpen={editModalOpen}
        closeModal={() => setEditModalOpen(false)}
        proportion={weightOnEdit}
        onDone={fetch}
      />
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Weight</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proportions.map(proportion => (
              <TableRow key={proportion.id}>
                <TableCell component="th" scope="row">{proportion.user.name}</TableCell>
                <TableCell>{proportion.month} / {proportion.year}</TableCell>
                <TableCell>{proportion.amount}</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setWeightOnEdit(proportion); setEditModalOpen(true); }}><EditIcon /></IconButton>
                  <IconButton
                    onClick={() => ynabCli
                      .proportionActionRequest({ proportions: [proportion], actionType: 'DELETE' })
                      .then(fetch)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </div>
  )
};
