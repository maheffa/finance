import * as React from 'react';
import { FormControl, Grid, Button } from '@material-ui/core';
import { downloadYnabCSV } from '../actions';
import { TransactionLog } from '../../../api/ynab';
import { useStyles } from '../../../style';
import useTheme from '@material-ui/styles/useTheme/useTheme';

interface IExportProps {
  transactions: TransactionLog[];
}

export const Export: React.FunctionComponent<IExportProps> = ({ transactions }) => {
  const classes = useStyles(useTheme())();
  const selectedCount = transactions.length;

  return (
    <FormControl component="fieldset" className={classes.formControl}>
      <Grid container>
        <Grid item>
          <Button
            onClick={() => downloadYnabCSV(transactions)}
            disabled={selectedCount === 0}
            color="primary" variant="outlined"
          >
            Export to CSV
          </Button>
        </Grid>
      </Grid>
    </FormControl>
  );
};
