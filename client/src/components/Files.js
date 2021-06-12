import React, { Fragment, useState, useEffect } from 'react';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';

const Files = () =>
{
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose File');
  const [message, setMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState('');
  const [prevFiles, setPrevFiles] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const proxy = "http://localhost:5000";
  const handleError = (err) =>
  {
    if (err.response.status === 500) setMessage('There was a problem with the server');
    else setMessage(err.response.data.msg);
  };

  useEffect(
    () =>
    {
      const getFiles = async () =>
      {
        try
        {
          const res = await axios.get(proxy + '/');
          const filesArray = res.data.files;
          setPrevFiles(filesArray);
        }
        catch (err) { handleError(err); };
      }
      getFiles();
    }, []
  );

  const onFileChange = (event) =>
  {
    setFile(event.target.files[0]);
    setFilename(event.target.files[0].name);
  };

  const downloadHandler = async (id) =>
  {
    try
    {
      const res = await axios.post(proxy + '/',
      {
        id: id,
        delete: false
      });
      console.log(res);
    }
    catch (err){ handleError(err); };
  };

  const deleteHandler = async (id) =>
  {
    try
    {
      const res = await axios.post(proxy + '/',
      {
        id: id,
        delete: true
      });

      const { msg } = res.data;
      setMessage(msg);
    }
    catch (err){ handleError(err); };
  };

  const onSubmit = async (event) =>
  {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try
    {
      const res = await axios.post(proxy + '/', formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) =>
        {
          setUploadPercentage(
            parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total))
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
      handleError(err);
      setUploadPercentage(0);
    };
  };

  return (
    <Fragment>
      {message ? <Message msg={message} /> : null}

      <form onSubmit={onSubmit}>
        <div className='custom-file mb-4'>
          <input type='file' className='custom-file-input' id='customFile' onChange={onFileChange} />
          <label className='custom-file-label' htmlFor='customFile'>
            {filename}
          </label>
        </div>

        <Progress percentage={uploadPercentage} />
        <input type='submit' value='Upload' className='btn btn-primary btn-block mt-4' />
      </form>

      {prevFiles ? (
        prevFiles.map(prevFile => (
          <div key={prevFile._id} className='row mt-5'>
          <div className='col-md-6 m-auto'>
            <h3>{prevFile.filename}</h3>
            <input type='button' value='Download' onClick={downloadHandler} className='btn btn-secondary btn-block mt-4' />
            <input type='button' value='Delete' onClick={deleteHandler} className='btn btn-warning btn-block mt-4' />
          </div>
        </div>
        ))
      ) : null}

      {uploadedFile ? (
        <div className='row mt-5'>
          <div className='col-md-6 m-auto'>
            <h3 className='text-center'>{uploadedFile.filename}</h3>
            <input type='button' value='Download' onClick={downloadHandler(uploadedFile._id)} className='btn btn-secondary btn-block mt-4' />
            <input type='button' value='Delete' onClick={deleteHandler(uploadedFile._id)} className='btn btn-warning btn-block mt-4' />
          </div>
        </div>
      ) : null}
    </Fragment>
  );
};

export default Files;