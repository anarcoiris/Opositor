import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, CheckCircle, Rocket, ChevronRight, Layout, Star, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import data from './data.json';

const App = () => {
  const [activeTopicId, setActiveTopicId] = useState(data.topics[0].id);
  const [activeTab, setActiveTab] = useState('study'); // 'study' or 'quiz'
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);

  const activeTopic = data.topics.find(t => t.id === activeTopicId);

  const handleTopicChange = (id) => {
    setActiveTopicId(id);
    setActiveTab('study');
    setQuizFinished(false);
    setAnswers({});
    setCurrentQuestionIdx(0);
  };

  const handleAnswerSelect = (questionId, optionKey) => {
    if (quizFinished) return;
    setAnswers({ ...answers, [questionId]: optionKey });

    // Auto advance after short delay
    if (activeTopic.quiz && currentQuestionIdx < activeTopic.quiz.length - 1) {
      setTimeout(() => setCurrentQuestionIdx(prev => prev + 1), 500);
    } else {
      setTimeout(() => finishQuiz(), 500);
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    const score = calculateScore();
    if (score >= activeTopic.quiz.length * 0.8) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981']
      });
    }
  };

  const calculateScore = () => {
    return activeTopic.quiz.reduce((acc, q) => {
      const userAns = answers[q.id];
      const correctAns = q.answer;
      return userAns === correctAns ? acc + 1 : acc;
    }, 0);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <h1><Rocket size={28} /> OPI Study</h1>
        <nav className="nav-list">
          {data.topics.map(topic => (
            <div key={topic.id} className="nav-item">
              <a
                className={`nav-link ${activeTopicId === topic.id ? 'active' : ''}`}
                onClick={() => handleTopicChange(topic.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{topic.id}</span>
                  {topic.title}
                </div>
                <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: activeTopicId === topic.id ? 1 : 0.3 }} />
              </a>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
            <Layout size={14} /> Temario Común / Bloque {activeTopicId}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700 }}>{activeTopic.title}</h1>
        </header>

        {/* Tab Switcher */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'study' ? 'active' : ''}`}
            onClick={() => setActiveTab('study')}
          >
            <BookOpen size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Estudiar
          </button>
          <button
            className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            <CheckCircle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Cuestionario
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'study' ? (
            <motion.div
              key="study"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card"
            >
              <div className="prose">
                <ReactMarkdown>{activeTopic.content}</ReactMarkdown>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card"
            >
              {!quizFinished ? (
                <div className="quiz-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Pregunta {currentQuestionIdx + 1} de {activeTopic.quiz.length}</span>
                    <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{
                        width: `${((currentQuestionIdx + 1) / activeTopic.quiz.length) * 100}%`,
                        height: '100%',
                        background: 'var(--accent-primary)',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  <div className="question-card">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', lineHeight: 1.4 }}>
                      {activeTopic.quiz[currentQuestionIdx].text}
                    </h2>
                    <div className="options">
                      {activeTopic.quiz[currentQuestionIdx].options.map((opt) => {
                        const optionKey = opt.charAt(0); // A, B, C, D
                        return (
                          <button
                            key={opt}
                            className={`option-btn ${answers[activeTopic.quiz[currentQuestionIdx].id] === optionKey ? 'selected' : ''}`}
                            onClick={() => handleAnswerSelect(activeTopic.quiz[currentQuestionIdx].id, optionKey)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <Award size={80} color="var(--accent-primary)" style={{ margin: '0 auto' }} />
                  </div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>¡Cuestionario Completado!</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
                    Has acertado <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{calculateScore()}</span> de {activeTopic.quiz.length} preguntas.
                  </p>

                  <div style={{
                    fontSize: '3rem',
                    fontWeight: 800,
                    marginBottom: '2rem',
                    color: calculateScore() >= activeTopic.quiz.length * 0.5 ? 'var(--success)' : 'var(--error)'
                  }}>
                    {Math.round((calculateScore() / activeTopic.quiz.length) * 100)}%
                  </div>

                  <button className="btn-primary" onClick={() => {
                    setQuizFinished(false);
                    setAnswers({});
                    setCurrentQuestionIdx(0);
                  }}>
                    Reintentar Test
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div >
  );
};

export default App;
