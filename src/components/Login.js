import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  //const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);
      window.location.href = '/'; // Force reload to update user state
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <h2 className="text-center mb-5 fw-bold">Welcome to QuizMaster</h2>

              {/* Tabs */}
              <div className="d-flex mb-4 border-bottom">
                <Link
                  to="/login"
                  className="flex-fill text-center py-3 fw-bold text-decoration-none text-primary border-bottom border-primary border-3"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-fill text-center py-3 fw-bold text-decoration-none text-muted"
                >
                  Register
                </Link>
              </div>

              {error && <div className="alert alert-danger mb-4">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-medium">Username</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-medium">Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100">
                  Sign In
                </button>
              </form>

              <div className="text-center mt-4 text-muted">
                {/* <small>Admin: admin / admin123</small> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import API from '../api';

// export default function Login({ setUser }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const submit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await API.post('/login', { username, password });
//       localStorage.setItem('token', res.data.token);
//       localStorage.setItem('role', res.data.role);
//       localStorage.setItem('username', res.data.username);
//       setUser(res.data);
//       navigate('/');
//     } catch (err) {
//       setError(err.response?.data?.error || 'Error');
//     }
//   };

//   return (
//     <div className="row justify-content-center">
//       <div className="col-md-5">
//         <h2>Login</h2>
//         {error && <div className="alert alert-danger">{error}</div>}
//         <form onSubmit={submit}>
//           <input className="form-control mb-3" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
//           <input type="password" className="form-control mb-3" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
//           <button className="btn btn-primary w-100">Login</button>
//         </form>
//         <p className="mt-3">Admin: admin / admin123</p>
//         <Link to="/register">Register as student</Link>
//       </div>
//     </div>
//   );
// }