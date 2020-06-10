import { useQueryParam, DateParam } from 'use-query-params';
import { useState, useMemo } from 'react';
import moment from 'moment';
import { DATE_FORMAT } from '../constants';
import { List } from 'immutable';

export interface ITimeRange {
  from: Date;
  to: Date;
  fromFormatted: string;
  toFormatted: string;
}

export function useUrlTimeRange(defaultRange: number = 30 ): [ITimeRange, (from: Date | null) => void, (to: Date | null) => void] {
  const [queryFrom, setQueryFrom] = useQueryParam('from', DateParam);
  const [queryTo, setQueryTo] = useQueryParam('to', DateParam);
  const [fromDate, setFromDate] = useState<Date>(queryFrom || moment().subtract(defaultRange, 'days').toDate());
  const [toDate, setToDate] = useState<Date>(queryTo || new Date());

  return [
    {
      from: fromDate,
      to: toDate,
      fromFormatted: moment(fromDate).format(DATE_FORMAT),
      toFormatted: moment(toDate).format(DATE_FORMAT),
    },
    from => {
      if (from != null) {
        setFromDate(from);
        setQueryFrom(from);
      }
    },
    to => {
      if (to != null) {
        setToDate(to);
        setQueryTo(to);
      }
    },
  ]
}

interface ITableDataConfig<T> {
  comparator?: (r0: T, r1: T) => number,
  filter?: (r: T) => boolean,
  identifier?: (r: T) => any,
}

export function useTableData<T>(initialRows: List<T>, initialConfig?: ITableDataConfig<T>): [List<T>, (rows: List<T>) => void, (c: ITableDataConfig<T>['comparator']) => void, (c: ITableDataConfig<T>['filter']) => void] {
  // const identifyRows = (rs: List<T>) => initialConfig?.identifier ? rs.map(initialConfig.identifier) : rs;
  const [config, setConfig] = useState<ITableDataConfig<T>>(initialConfig || {});
  const [rows, setRows] = useState<List<T>>(initialRows);
  const filteredRows = useMemo<List<T>>(() => { console.log('Refiltering'); return config.filter ? rows.filter(config.filter) : rows } , [config.filter, rows.hashCode()]);
  const sortedRows = useMemo<List<T>>(() => config.comparator ? rows.sort(config.comparator) : rows, [config.comparator, filteredRows.hashCode()]);
  return [
    sortedRows,
    setRows,
    comparator => setConfig({ ...config, comparator }),
    filter => setConfig({ ...config, filter }),
  ];
}