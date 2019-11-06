import * as React from 'react';

interface ICombinedFinanceProps {
  data: string;
}

export const CombinedFinance: React.FunctionComponent<ICombinedFinanceProps> =
  ({ data }) => <div>Here goes the combined {data}</div>;
