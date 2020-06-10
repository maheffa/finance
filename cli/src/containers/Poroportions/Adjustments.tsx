import * as React from 'react';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { ProportionResponse } from '../../api/ynab';
import { useUrlTimeRange } from '../hooks';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ynabCli } from '../../api/YnabClient';
import {
  Button,
  makeStyles,
  Card,
  Typography,
  CardContent,
  createStyles,
  Theme,
  Tooltip,
  IconButton,
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';

const useStyles = makeStyles((theme: Theme) => createStyles({
  dateFilter: {
    display: 'flex',
    alignItems: 'center',
  },
  btnFilter: {
    marginTop: '16px',
    marginLeft: '8px',
  },
  card: {
    backgroundColor: theme.palette.background.default,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  receive: {
    color: 'green',
  },
  pay: {
    color: 'red',
  },
  adjustments: {
    marginTop: '4px',
    marginBottom: '4px',
  },
  adjustment: {
    marginTop: '2px',
  },
}));

export const Adjustments: React.FunctionComponent = () => {
  const styles = useStyles();
  const [timeRange, setTimeRangeFrom, setTimeRangeTo] = useUrlTimeRange(365);
  const [loading, setLoading] = useState<boolean>(false);
  const [proportionResponses, setProportionResponses] = useState<ProportionResponse[][]>([]);

  const fetch = () => {
    setLoading(true);
    ynabCli
      .detailedAdjustments({ from: timeRange.fromFormatted, to: timeRange.toFormatted })
      .then(res => setProportionResponses(res.reverse()))
  };

  useEffect(() => fetch(), []);

  return (
    <div>
      <div className={styles.dateFilter}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            variant="inline" format="dd/MM/yyyy" margin="normal" id="date-picker-from" label="From"
            value={timeRange.from} onChange={setTimeRangeFrom}
            KeyboardButtonProps={{ 'aria-label': 'change date' }}
            disableToolbar
          />
          <KeyboardDatePicker
            variant="inline" format="dd/MM/yyyy" margin="normal" id="date-picker-to" label="To"
            value={timeRange.to} onChange={setTimeRangeTo}
            KeyboardButtonProps={{ 'aria-label': 'change date' }}
            disableToolbar
          />
        </MuiPickersUtilsProvider>
        <Button onClick={() => fetch()} color="primary" variant="outlined" className={styles.btnFilter}>
          Show
        </Button>
      </div>
      <div>
        {
          proportionResponses.map(proportionResponse => {
            const total = proportionResponse.reduce((sum, next) => sum + next.paid, 0);
            const month = moment({ month: proportionResponse[0]?.month, year: proportionResponse[0]?.year }).format('MMMM YYYY');
            return (
              <Card className={styles.card}>
                <CardContent>
                  <strong>{month}</strong>
                  <div>Total spending is <strong>€{total.toFixed(2)}</strong>.</div>
                  <ul className={styles.adjustments}>
                    {proportionResponse.map(response => (
                      <li className={styles.adjustment}>
                        <strong>{response.user.name} </strong>
                        <span>has paid €{response.paid.toFixed(2)}, </span>
                        <span>should contribute </span>
                        <Tooltip
                          placement="top-end"
                          title={`${response.user.name} should be paying ${Math.round(response.comp / response.totalComp * 100)}% of ${total} total spending`}
                        >
                          <span>€{(response.comp / response.totalComp * total).toFixed(2)}</span>
                        </Tooltip>
                        <span>, therefore should </span>
                        <strong className={response.adjustment > 0 ? styles.receive : styles.pay}>{response.adjustment > 0 ? 'receive a compensation of' : 'pay an additional'} </strong>
                        <span className={response.adjustment > 0 ? styles.receive : styles.pay}>€{Math.abs(response.adjustment).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })
        }
      </div>
    </div>
  );
};
