import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

export default function StudentDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState({});

  useEffect(() => {
    async function fetchData() {
      const quizzesRes = await API.get('/quizzes');
      setQuizzes(quizzesRes.data);

      const attemptsRes = await API.get('/attempts');
      setAttempts(attemptsRes.data);
    }
    fetchData();
  }, []);

  const getStatus = (quizId) => {
    const attempt = attempts[quizId];
    if (!attempt) return <span className="badge bg-secondary">Not Taken Yet</span>;
    return (
      <span className={`badge ${attempt.passed ? 'bg-success' : 'bg-danger'}`}>
        Score: {attempt.score}% • {attempt.passed ? 'Passed 🎉' : 'Failed'}
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-center mb-5">Welcome to Your Quiz Dashboard</h1>
      <div className="row">
        {quizzes.length === 0 ? (
          <div className="col-12 text-center"><p>No active quizzes available.</p></div>
        ) : (
          quizzes.map(q => (
            <div key={q.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h4 className="card-title">{q.title}</h4>
                  <div className="mt-3">{getStatus(q.id)}</div>
                  <div className="mt-auto pt-4">
                    <Link to={`/quiz/${q.id}`} className="btn btn-primary w-100">
                      {attempts[q.id] ? 'Re-take Quiz' : 'Start Quiz'} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}