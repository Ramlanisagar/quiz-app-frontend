import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

export default function AdminPanel() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    const res = await API.get('/quizzes/admin');
    const quizzesData = res.data;

    // Get attempt counts
    const attemptsRes = await fetch('http://localhost:5000/api/attempts/all', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json()).catch(() => ({}));

    const enhanced = quizzesData.map(quiz => {
      let attemptCount = 0;
      Object.values(attemptsRes).forEach(userAttempts => {
        if (userAttempts[quiz.id]) attemptCount++;
      });
      return { ...quiz, attemptCount };
    });

    setQuizzes(enhanced);
  };

  const toggleActive = async (quiz) => {
    const res = await API.put(`/quizzes/${quiz.id}`, { active: !quiz.active });
    setQuizzes(quizzes.map(q => q.id === quiz.id ? { ...res.data, attemptCount: quiz.attemptCount } : q));
  };

  const deleteQuiz = async (id) => {
    if (!window.confirm('Delete this quiz permanently?')) return;
    await API.delete(`/quizzes/${id}`);
    setQuizzes(quizzes.filter(q => q.id !== id));
  };

  const downloadResults = (quizId, quizTitle) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/api/quizzes/${quizId}/results`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quizTitle.replace(/[^a-z0-9]/gi, '_')}_Results.xlsx`;
      a.click();
      a.remove();
    })
    .catch(() => alert('No results yet'));
  };

  return (
    <div>
      <h1 className="text-center mb-4">Admin Dashboard</h1>

      <div className="text-center mb-5">
        <Link to="/create-quiz" className="btn btn-success btn-lg px-5 py-4 shadow">
          <strong>+ Create New Quiz</strong>
        </Link>
      </div>

      <h3 className="mb-4">Manage Quizzes ({quizzes.length})</h3>

      <div className="row">
        {quizzes.length === 0 ? (
          <div className="col-12 text-center py-5">
            <p className="text-muted fs-4">No quizzes yet. Click the button above to create your first quiz!</p>
          </div>
        ) : (
          quizzes.map(quiz => (
            <div key={quiz.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                    <h4 className="card-title">{quiz.title}</h4>
                    <p className="text-muted">
                        {quiz.questions.length} Questions
                    </p>

                    <div className="mb-4">
                        <span className={`status-badge ${quiz.active !== false ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                        {quiz.active !== false ? '✓ Active' : '✗ Inactive'}
                        </span>
                    </div>

                    <div className="mb-4">
                        <p className="text-muted mb-1">Students Attempted</p>
                        <p className="attempt-count">{quiz.attemptCount}</p>
                    </div>

                    <div className="mt-auto d-grid gap-2">
                            <Link to={`/create-quiz/${quiz.id}`} className="btn btn-primary">
                            ✏️ Edit
                            </Link>
                            <button className="btn btn-info text-white" onClick={() => toggleActive(quiz)}>
                            {quiz.active !== false ? 'Deactivate' : 'Activate'}
                            </button>
                            <button className="btn btn-success" onClick={() => downloadResults(quiz.id, quiz.title)}>
                            📊 Download Excel
                            </button>
                            <button className="btn btn-danger" onClick={() => deleteQuiz(quiz.id)}>
                            🗑️ Delete
                            </button>
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