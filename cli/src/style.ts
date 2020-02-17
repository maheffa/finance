import makeStyles from '@material-ui/styles/makeStyles/makeStyles';
import { Theme } from '@material-ui/core';
import createStyles from '@material-ui/styles/createStyles/createStyles';

export const useStyles = (theme: Theme) => makeStyles(createStyles({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing(3),
    marginBottom: theme.spacing(5),
  },
  group: {
    margin: theme.spacing(1, 0),
  },
  inFlow: {
    color: `${theme.palette.primary.main} !important`,
  },
  outFlow: {
    color: `${theme.palette.error.light} !important`,
  },
  tableRow: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));
