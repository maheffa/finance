import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import RootRef from '@material-ui/core/RootRef';
import ListIcon from '@material-ui/icons/List';
import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {ApiClient, ITransactionLog} from '../../Models/ApiClient';
import {Content} from './Content';
import {List} from 'immutable';
import {ExportType} from './actions';

const apiCli = new ApiClient();

export const Parser: React.FunctionComponent = () => {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [requesting, setRequesting] = useState(false);
  const [toExportTransactions, exportTransactions] = useState<List<ITransactionLog>>(List<ITransactionLog>());
  const [exportType, setExportType] = useState<ExportType>(ExportType.COMBINED_FINANCE);
  const [parsed, setParsed] = useState<ITransactionLog[]>([]);
  const onDrop = useCallback((files: File[]) => setFile(files[0]), []);
  const {getRootProps, getInputProps} = useDropzone({onDrop});
  const {ref, ...rootProps} = getRootProps();
  const onUpload = () => setRequesting(true);

  useEffect(() => {
    if (requesting && file) {
      setParsed([]);
      apiCli.uploadAbnReport(file).then(newParsed => {
        setRequesting(false);
        setParsed(newParsed);
      });
    }
  }, [requesting]);

  return (
    <div>
      <Box mb={3}>
        <RootRef rootRef={ref}>
          <Paper {...rootProps}>
            <input {...getInputProps()} />
            <Box component="div" p={4}>
              {
                file === undefined
                  ? 'Drop ABN AMRO transaction file here'
                  : file.name
              }
            </Box>
          </Paper>
        </RootRef>
        <Box mt={2} mb={2}>
          <Button
            color="primary"
            disabled={file === undefined || requesting}
            variant="outlined"
            onClick={onUpload}
          >
            Parse
            <ListIcon />
          </Button>
        </Box>
      </Box>
      <Box>
        {
          parsed.length > 0 ? (
            <Content
              transactions={parsed}
              exportTransactions={exportTransactions}
              toExportTransactions={toExportTransactions}
              setExportType={setExportType}
              exportType={exportType}
            />
          ) : null
        }
      </Box>
    </div>
  );
};
