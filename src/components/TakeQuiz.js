import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import jsPDF from 'jspdf';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // key: question index → answer
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(null);

  const PASSING_MARK = 60;
  const username = localStorage.getItem('username') || 'Student';
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    API.get(`/quizzes/${id}`).then(res => setQuiz(res.data));
  }, [id]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  const handleChange = (value) => {
    setAnswers({ ...answers, [currentQuestionIndex]: value });
  };

  const handleMultiSelect = (option, checked) => {
    const current = answers[currentQuestionIndex] || [];
    if (checked) {
      setAnswers({ ...answers, [currentQuestionIndex]: [...current, option] });
    } else {
      setAnswers({ ...answers, [currentQuestionIndex]: current.filter(v => v !== option) });
    }
  };

  const goNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      const userAns = answers[idx];
      const correctAns = q.correct;

      if (q.type === 'multi_select') {
        const userSorted = (userAns || []).sort();
        const correctSorted = Array.isArray(correctAns)
          ? correctAns.sort()
          : correctAns.split(',').map(c => c.trim()).sort();
        if (JSON.stringify(userSorted) === JSON.stringify(correctSorted)) correct++;
      } else if (String(userAns)?.trim() === String(correctAns)?.trim()) {
        correct++;
      }
    });

    const percentage = quiz.questions.length > 0 ? (correct / quiz.questions.length) * 100 : 0;
    return percentage.toFixed(2);
  };

  const submitQuiz = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResult(true);
    API.post('/attempts', { quizId: id, score: finalScore });
  };

  const attemptedCount = Object.keys(answers).length;
  const totalQuestions = quiz?.questions.length || 0;

  const generateCertificate = () => {
    // (Same certificate code as before - kept unchanged)
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(4);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'S');
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(2);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30, 'S');

    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 215, 0);
    doc.text('Certificate of Achievement', pageWidth / 2, 45, { align: 'center' });

    doc.setFontSize(90);
    doc.text('🏆', pageWidth / 2, 85, { align: 'center' });

    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', pageWidth / 2, 110, { align: 'center' });

    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 100, 200);
    doc.text(username, pageWidth / 2, 130, { align: 'center' });

    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the quiz', pageWidth / 2, 150, { align: 'center' });
    doc.text(`"${quiz.title}"`, pageWidth / 2, 165, { align: 'center' });
    doc.text(`with an outstanding score of ${score}%`, pageWidth / 2, 180, { align: 'center' });

    doc.setFontSize(18);
    doc.text(`Date: ${currentDate}`, pageWidth / 2, 205, { align: 'center' });

    doc.setFontSize(16);
    doc.text('_________________________', pageWidth / 2, 230, { align: 'center' });
    doc.text('Quiz Administrator', pageWidth / 2, 240, { align: 'center' });

    doc.save(`Certificate_${username}_${quiz.title.replace(/\s+/g, '_')}.pdf`);
  };

  const reattemptQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setScore(null);
    setShowResult(false);
  };

  if (!quiz) return <div className="text-center mt-5"><h3>Loading quiz...</h3></div>;

  if (showResult) {
    const passed = parseFloat(score) >= PASSING_MARK;

    return (
      <div className="container mt-0">
        <div className="text-center result-hero py-5">
          <div style={{ fontSize: '100px' }}>🏆</div>
          <h1 className="display-4">Quiz Complete!</h1>
          <h2 className="mt-3">{passed ? 'Congratulations! You Passed!' : 'Keep Practicing!'}</h2>
        </div>

        <div className="text-center">
          <h3>Your Score: <strong style={{fontSize: '2.5rem', color: passed ? '#FF9900' : '#dc3545'}}>{score}%</strong></h3>

          {passed && (
            <div className="my-5">
              <button className="btn btn-warning btn-lg px-5 py-4 shadow" onClick={generateCertificate}>
                <strong>📜 Download Certificate</strong>
              </button>
            </div>
          )}

          <div className="mt-4">
            <button className="btn btn-primary btn-lg me-4" onClick={reattemptQuiz}>Re-attempt</button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/')}>Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="card shadow-lg take-quiz-card">
        <div className="card-header bg-primary text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">{quiz.title}</h3>
            <div>
              <span className="badge bg-light text-dark fs-5 me-3">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="badge bg-warning text-dark fs-5">
                Attempted: {attemptedCount} / {totalQuestions}
              </span>
            </div>
          </div>
        </div>

        <div className="card-body p-5">
          <h4 className="mb-3">Question {currentQuestionIndex + 1}</h4>
          <p className="lead mb-4" style={{ fontSize: '1.4rem' }}>{currentQuestion.text}</p>

          {/* Question Types */}
          {currentQuestion.type === 'single_select' && currentQuestion.options.map((opt, idx) => (
            
            <div className="mb-3">
              <input
                className="form-check-input"
                type="radio"
                name="single"
                value={opt}
                checked={answers[currentQuestionIndex] === opt}
                onChange={(e) => handleChange(e.target.value)}
              />
              <label className="form-check-label fs-5 w-100 ps-3 py-3 rounded border" style={{ cursor: 'pointer' }}>
                {opt}
              </label>
            </div>
          ))}

          {currentQuestion.type === 'multi_select' && currentQuestion.options.map((opt, idx) => (
            <div className="form-check form-check-inline mb-3" key={idx} style={{ width: '100%' }}>
              <input
                className="form-check-input"
                type="checkbox"
                value={opt}
                checked={(answers[currentQuestionIndex] || []).includes(opt)}
                onChange={(e) => handleMultiSelect(opt, e.target.checked)}
              />
              <label className="form-check-label fs-5 w-100 ps-3 py-3 rounded border" style={{ cursor: 'pointer' }}>
                {opt}
              </label>
            </div>
          ))}

          {currentQuestion.type === 'integer' && (
            <input
              type="number"
              className="form-control form-control-lg w-50"
              value={answers[currentQuestionIndex] || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Enter your answer"
            />
          )}

          {currentQuestion.type === 'text' && (
            <textarea
              className="form-control form-control-lg"
              rows="5"
              value={answers[currentQuestionIndex] || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Type your answer here..."
            />
          )}
        </div>

        <div className="card-footer bg-light py-4">
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-secondary btn-lg px-5"
              onClick={goPrev}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                className="btn btn-success btn-lg px-5"
                onClick={submitQuiz}
                //disabled={attemptedCount < totalQuestions}
              >
                Submit Quiz
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg px-5"
                onClick={goNext}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}