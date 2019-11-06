import Box from '@material-ui/core/Box';
import * as React from 'react';
import { useState } from 'react';
import { Content } from './components/Content';
import { TransactionLog } from '../../api/ynab';
import { FileUpload } from './components/FileUpload';
import { ParseController } from './components/ParseController';

export const Parser: React.FunctionComponent = () => {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [parsed, setParsed] = useState<TransactionLog[]>([]);

  return (
    <div>
      <Box mb={3}>
        <FileUpload file={file} setFile={setFile} />
        <ParseController setFile={setFile} file={file} setParsed={setParsed} />
      </Box>
      <Box>
        { parsed.length > 0 ?  <Content transactions={parsed} /> : null }
      </Box>
    </div>
  );
};
