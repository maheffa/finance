import * as React from 'react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import RootRef from '@material-ui/core/RootRef';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';

interface IFileUploadProps {
  file: File | undefined;
  setFile: (file: File) => void;
}

export const FileUpload: React.FunctionComponent<IFileUploadProps> = ({ file, setFile }) => {
  const onDrop = useCallback((files: File[]) => setFile(files[0]), []);
  const {getRootProps, getInputProps} = useDropzone({onDrop});
  const {ref, ...rootProps} = getRootProps();
  return (
    <RootRef rootRef={ref}>
      <Paper {...rootProps}>
        <input {...getInputProps()} />
        <Box component="div" p={4}>
          { file === undefined ? 'Drop file here, or click here to open a file' : file.name }
        </Box>
      </Paper>
    </RootRef>
  );
};
