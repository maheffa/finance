import * as React from 'react';
import { AppBar, Tabs, Tab, makeStyles } from '@material-ui/core';
import { useState } from 'react';
import { Adjustments } from './Adjustments';
import { Weights } from './Weights';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  tabs: {
    backgroundColor: 'transparent',
  },
});

export const Proportions: React.FunctionComponent = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const styles = useStyles();
  let visibleElement = null;
  switch (activeIndex) {
    case 0:
      visibleElement = <Adjustments />;
      break;
    case 1:
      visibleElement = <Weights />;
      break;
  }
  return (
    <div className={styles.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={activeIndex}
          indicatorColor="primary"
          textColor="primary"
          className={styles.tabs}
          onChange={(evt, newActiveIndex) => setActiveIndex(newActiveIndex)}
        >
          <Tab label="Adjustments"/>
          <Tab label="Proportions"/>
        </Tabs>
      </AppBar>
      {visibleElement}
    </div>
  );
};
