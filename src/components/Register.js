import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Register({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/register', { username, password });
      alert('Registered! Now login');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <h2>Register (Students)</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit}>
          <input className="form-control mb-3" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" className="form-control mb-3" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn btn-success w-100">Register</button>
        </form>
      </div>
    </div>
  );
}