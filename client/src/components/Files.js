import React, { Fragment, useState, useEffect } from 'react';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';
import FileSaver from 'file-saver';

const Files = () =>
{
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choose File');
  const [message, setMessage] = useState('');
  const [storageFiles, setStorageFiles] = useState('');
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
          const res = await axios.get(`${proxy}/`);
          const filesArray = res.data.files;
          setStorageFiles(filesArray);
        }
        catch (err) { handleError(err); };
      }
      getFiles();
    }, []
  );

  const onFileChange = (event) =>
  {
    if(event.target.files[0] !== undefined)
    {
      setFile(event.target.files[0]);
      setFilename(event.target.files[0].name);
    }
    else
    {
      setFile('');
      setFilename('Choose File')
    }
  };

  const downloadHandler = async (filename) =>
  {
    try
    {
      const res = await axios.post(`${proxy}/${filename}`, { delete: false }, { responseType: "blob" });
      FileSaver.saveAs(res.data, filename);
    }
    catch (err){ handleError(err); };
  };

  const deleteHandler = async (id) =>
  {
    try
    {
      const res = await axios.post(`${proxy}/${id}`,
      {
        delete: true
      });

      setStorageFiles(storageFiles.filter(file => file._id !== id))
      const { msg } = res.data;
      setMessage(msg);
    }
    catch (err){ handleError(err); };
  };

  const submitHandler = async (event) =>
  {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try
    {
      const res = await axios.post(`${proxy}/`, formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) =>
        {
          setUploadPercentage(
            parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total))
          );
        }
      });
      const { filename, id } = res.data;
      if(storageFiles !== '') setStorageFiles([ ...storageFiles, { filename: filename, _id: id } ]);
      else setStorageFiles({ filename: filename, _id: id })
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

      <form onSubmit={submitHandler}>
        <div className='custom-file mb-4'>
          <input type='file' className='custom-file-input' id='customFile' onChange={onFileChange} />
          <label className='custom-file-label' htmlFor='customFile'>
            {filename}
          </label>
        </div>

        <Progress percentage={uploadPercentage} />
        <input type='submit' value='Upload' className='btn btn-primary btn-block mt-4' />
      </form>

      {storageFiles ? (
        storageFiles.map(prevFile => (
          <div key={prevFile._id} className='row mt-5'>
          <div className='card col-md-6 m-auto'>
            <h3>{prevFile.filename}</h3>
            <input type='button' value='Download' onClick={() => {downloadHandler(prevFile.filename)}} className='btn btn-secondary btn-block mt-4' />
            <input type='button' value='Delete' onClick={() => {deleteHandler(prevFile._id)}} className='btn btn-warning btn-block mt-4' />
            <br></br>
          </div>
        </div>
        ))
      ) : null}
    </Fragment>
  );
};

export default Files;