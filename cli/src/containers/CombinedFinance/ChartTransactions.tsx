import React, { useState } from 'react';
import { Transaction } from '../../api/ynab';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import moment from 'moment';
import { IStackedGroup, groupTransactions, stackGroup, TransactionGrouping } from './util';
import { Theme, createStyles, makeStyles } from '@material-ui/core';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';

interface IChartTransactionsProps {
  loading: boolean;
  transactions: Transaction[];
}

const barColors = ['#E57373', '#3d556a', '#A5D6A7', '#73a613', '#BCAAA4', '#CE93D8', '#B0BEC5', '#F48FB1', '#C5E1A5'];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    switchRoot: {
      display: 'flex',
      alignItems: 'center',
    },
    toggleContainer: {
      'display': 'flex',
      'flexDirection': 'column',
      'alignItems': 'center',
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  })
);

export const ChartTransactions: React.FunctionComponent<IChartTransactionsProps> = ({ loading, transactions }) => {
  const styles = useStyles();
  const [groupBy, setGroupBy] = useState<TransactionGrouping>(TransactionGrouping.BY_MEMO);
  if (transactions.length === 0) {
    return null;
  }

  const chartData: Array<{ name: string, stacked: IStackedGroup }> = groupTransactions(transactions).map(g => ({
    name: moment([g.year, g.month]).format('MMM YYYY'),
    stacked: stackGroup(g, groupBy),
  }));
  const allKeys = new Set(chartData.map(c => Object.keys(c.stacked)).flat(1));

  return (
    <div>
      <div className={styles.switchRoot}>
        <div>Group by: </div>
        <div className={styles.toggleContainer}>
          <ToggleButtonGroup value={groupBy} onChange={(event: any, value: TransactionGrouping) => setGroupBy(value || groupBy)} exclusive>
            <ToggleButton value={TransactionGrouping.BY_MEMO}>Category</ToggleButton>
            <ToggleButton value={TransactionGrouping.BY_USER}>User</ToggleButton>
            <ToggleButton value={TransactionGrouping.BY_PAYEE}>Payee</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>
      <AreaChart
        width={750}
        height={400}
        data={chartData.map(c => ({ name: c.name, ...c.stacked }))}
        margin={{
          top: 20, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid  strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => [`${Number(value).toFixed(2)} \u20AC`, name]}
        />
        <Legend />
        {Array.from(allKeys).map((k: string, index: number) => (
          <Area
            key={k}
            type="linear"
            dataKey={k}
            stackId="1"
            stroke={barColors[index % barColors.length]}
            fill={barColors[index % barColors.length]}
          />
        ))}
      </AreaChart>
    </div>
  );
};
