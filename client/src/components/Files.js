import React, { Fragment, useState } from 'react';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';

const FileUpload = () =>
{
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose File');
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const onChange = (event) =>
  {
    setFile(event.target.files[0]);
    setFilename(event.target.files[0].name);
  };

  const onSubmit = async (event) =>
  {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try
    {
      const res = await axios.post('/', formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );
        }
      });
      const { fileName, id } = res.data;
      setUploadedFile(fileName, id);
      setMessage('File Uploaded');
      setTimeout(() => setUploadPercentage(0), 2000);
    }
    catch (err)
    {
      console.log(err)
      if (err.response.status === 500) setMessage('There was a problem with the server');
      else setMessage(err.response.data.msg);
      setUploadPercentage(0);
    }
  };

  return (
    <Fragment>
      {message ? <Message msg={message} /> : null}

      <form onSubmit={onSubmit}>
        <div className='custom-file mb-4'>
          <input type='file' className='custom-file-input' id='customFile' onChange={onChange} />
          <label className='custom-file-label' htmlFor='customFile'>
            {filename}
          </label>
        </div>

        <Progress percentage={uploadPercentage} />
        <input type='submit' value='Upload' className='btn btn-primary btn-block mt-4' />
      </form>

      {uploadedFile ? (
        <div className='row mt-5'>
          <div className='col-md-6 m-auto'>
            <a href={uploadedFile.id}><h3 className='text-center'>{uploadedFile.fileName}</h3></a>
          </div>
        </div>
      ) : null}
    </Fragment>
  );
};

export default FileUpload;