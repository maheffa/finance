import * as React from 'react';

interface IParserProps {
  children: React.ReactNode;
}

export const Parser: React.FunctionComponent<IParserProps> =
  ({ children }) => <div>Here goes the parser</div>;
