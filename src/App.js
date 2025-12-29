import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import API from './api';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import StudentDashboard from './components/StudentDashboard';
import TakeQuiz from './components/TakeQuiz';
import Navbar from './components/Navbar';
import QuizForm from './components/QuizForm';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    if (token) setUser({ token, role, username });
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <Router>
      <Navbar user={user} logout={logout} />
      <div className="container mt-5">
        <Routes>
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/" element={user ? (user.role === 'admin' ? <AdminPanel /> : <StudentDashboard />) : <Navigate to="/login" />} />
          <Route path="/quiz/:id" element={user?.role === 'student' ? <TakeQuiz /> : <Navigate to="/login" />} />
          <Route path="/create-quiz" element={user?.role === 'admin' ? <QuizForm /> : <Navigate to="/" />} />
          <Route path="/create-quiz/:id" element={user?.role === 'admin' ? <QuizForm /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
