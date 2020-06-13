import * as React from 'react';
import { TextField, makeStyles, Button } from '@material-ui/core';
import { useState, FormEventHandler, useEffect } from 'react';

interface IAuthProps {
  setPass: (val: string) => void;
}

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  form: {
    marginTop: 150,
  },
});

export const Auth: React.FunctionComponent<IAuthProps> = ({ setPass }) => {
  const [password, setPassword] = useState('');
  const [nAttempts, setNAttempts] = useState(0);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const styles = useStyles();

  useEffect(() => {
    setTimeout(() => {
      if (waitSeconds > 0) {
        setWaitSeconds(waitSeconds - 1);
      }
    }, 1000);
  });

  const onSubmit: FormEventHandler = e => {
    e.preventDefault();
    setPass(password);
    setNAttempts(nAttempts + 1);
    if (nAttempts <= 0) {
      setWaitSeconds(3);
    } else if (nAttempts <= 2) {
      setWaitSeconds(5);
    } else {
      setWaitSeconds(60);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form autoComplete="off" onSubmit={onSubmit} className={styles.form}>
        <TextField type="password" onChange={e => setPassword(e.target.value)} value={password} disabled={!!waitSeconds} />
        <Button type="submit">Unlock</Button>
        {waitSeconds ? <div>Try again in {waitSeconds} seconds</div> : null}
      </form>
    </div>
  )
};
