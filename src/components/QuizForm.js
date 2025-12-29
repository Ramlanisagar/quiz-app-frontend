import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

export default function QuizForm() {
  const { id } = useParams(); // If id exists → Edit mode
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ text: '', type: 'single_select', options: '', correct: '' }]);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (id) {
      // Edit mode: fetch quiz
      setIsEdit(true);
      API.get(`/quizzes/${id}`).then(res => {
        const quiz = res.data;
        setTitle(quiz.title);
        setQuestions(quiz.questions.map(q => ({
          text: q.text,
          type: q.type,
          options: q.options ? q.options.join(', ') : '',
          correct: Array.isArray(q.correct) ? q.correct.join(', ') : q.correct
        })));
      });
    }
  }, [id]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', type: 'single_select', options: '', correct: '' }]);
  };

  const updateQuestion = (i, field, value) => {
    const newQ = [...questions];
    newQ[i][field] = value;
    setQuestions(newQ);
  };

  const removeQuestion = (i) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, index) => index !== i));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedQuestions = questions.map(q => ({
      ...q,
      options: q.options ? q.options.split(',').map(o => o.trim()).filter(o => o) : [],
      correct: q.type === 'multi_select' 
        ? q.correct.split(',').map(c => c.trim()).filter(c => c)
        : q.correct.trim()
    }));

    if (isEdit) {
      await API.put(`/quizzes/${id}`, { title, questions: formattedQuestions });
      alert('Quiz updated successfully!');
    } else {
      await API.post('/quizzes', { title, questions: formattedQuestions });
      alert('Quiz created successfully!');
    }
    navigate('/'); // Back to Admin Dashboard
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-body p-5">
          <h2 className="text-center mb-5">{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-bold">Quiz Title</label>
              <input
                className="form-control form-control-lg"
                placeholder="Enter quiz title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <h4 className="mb-4">Questions</h4>
            {questions.map((q, i) => (
              <div key={i} className="border rounded p-4 mb-4 bg-light position-relative">
                <div className="mb-3">
                  <label className="form-label">Question {i + 1}</label>
                  <input
                    className="form-control"
                    placeholder="Enter question text"
                    value={q.text}
                    onChange={e => updateQuestion(i, 'text', e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={q.type} onChange={e => updateQuestion(i, 'type', e.target.value)}>
                    <option value="single_select">Single Select</option>
                    <option value="multi_select">Multi Select</option>
                    <option value="integer">Integer</option>
                    <option value="text">Text</option>
                  </select>
                </div>

                {(q.type === 'single_select' || q.type === 'multi_select') && (
                  <div className="mb-3">
                    <label className="form-label">Options (comma separated)</label>
                    <input
                      className="form-control"
                      placeholder="e.g. Option A, Option B, Option C"
                      value={q.options}
                      onChange={e => updateQuestion(i, 'options', e.target.value)}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Correct Answer(s)</label>
                  <input
                    className="form-control"
                    placeholder={q.type === 'multi_select' ? "e.g. Option A, Option C" : "Enter correct answer"}
                    value={q.correct}
                    onChange={e => updateQuestion(i, 'correct', e.target.value)}
                    required
                  />
                </div>

                {questions.length > 1 && (
                    <button
                        type="button"
                        className="btn btn-link text-danger position-absolute top-0 end-0 mt-2 me-2 p-1"
                        onClick={() => removeQuestion(i)}
                        title="Delete Question"
                        style={{ fontSize: '1.2rem', lineHeight: '1' }}
                    >
                        ✕
                    </button>
                )}
              </div>
            ))}

            <div className="d-flex justify-content-between mt-5">
              <button type="button" className="btn btn-secondary btn-lg px-5" onClick={addQuestion}>
                + Add Question
              </button>

              <div>
                <button type="button" className="btn btn-outline-secondary btn-lg me-3" onClick={() => navigate('/')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success btn-lg px-5">
                  {isEdit ? 'Update Quiz' : 'Create Quiz'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}