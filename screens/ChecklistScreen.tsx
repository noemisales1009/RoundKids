
import React, { useState, useMemo, useContext, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Answer, Question } from '../types';
import { PatientsContext } from '../contexts';
import { useHeader } from '../hooks';
import { CheckIcon, AlertIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons';

const AlertModal = lazy(() => import('../components/modals').then(m => ({ default: m.AlertModal })));

export const ChecklistScreen: React.FC = () => {
    const { patientId, categoryId, questionIndex } = useParams<{ patientId: string; categoryId: string; questionIndex: string }>();
    const { patients, questions, checklistAnswers, saveChecklistAnswer, categories } = useContext(PatientsContext)!;

    const patient = patients.find(p => p.id.toString() === patientId);
    const category = categories.find(c => c.id.toString() === categoryId);

    const [activeAlertQuestion, setActiveAlertQuestion] = useState<Question | null>(null);

    // Filter questions based on category using questions from context
    const categoryQuestions = useMemo(() => {
        return questions.filter(q => q.categoryId != null && q.categoryId.toString() === categoryId);
    }, [questions, categoryId]);

    const navigate = useNavigate();

    const currentQuestionIndex = useMemo(() => {
        const idx = parseInt(questionIndex || '0', 10);
        if (isNaN(idx) || idx < 0 || idx >= categoryQuestions.length) {
            return 0;
        }
        return idx;
    }, [questionIndex, categoryQuestions]);

    useHeader(category ? `Checklist: ${category.name}` : 'Checklist');

    // Get existing answer from context
    const currentAnswer = patientId && categoryQuestions[currentQuestionIndex]
        ? checklistAnswers[patientId]?.[categoryQuestions[currentQuestionIndex].id]
        : undefined;

    const handleAnswer = async (questionId: number, answer: Answer) => {
        if (patientId && categoryId) {
            await saveChecklistAnswer(patientId, parseInt(categoryId), questionId, answer);
        }
    };

    const handleSave = () => {
        if (!patientId) return;
        navigate(`/patient/${patientId}/round/categories`);
    };

    const handleNext = () => {
        if (currentQuestionIndex < categoryQuestions.length - 1) {
            navigate(`/patient/${patientId}/round/category/${categoryId}/question/${currentQuestionIndex + 1}`);
        } else {
            handleSave();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            navigate(`/patient/${patientId}/round/category/${categoryId}/question/${currentQuestionIndex - 1}`);
        }
    };

    if (!patient || !category || categoryQuestions.length === 0) {
        return <p>Paciente, categoria ou perguntas não encontrados.</p>;
    }

    const currentQuestion = categoryQuestions[currentQuestionIndex];

    return (
        <div className="relative min-h-screen pb-6 px-4 flex items-center justify-center">
            {/* Main Card */}
            <div className="w-full max-w-lg bg-blue-600 dark:bg-blue-700 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-300">

                {/* Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col items-center text-center space-y-4 sm:space-y-6">
                    <span className="bg-blue-800/50 text-blue-100 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                        {category.name} • {currentQuestionIndex + 1}/{categoryQuestions.length}
                    </span>

                    <h1 className="text-white text-lg sm:text-xl md:text-2xl font-extrabold leading-tight flex items-center justify-center px-2">
                        {currentQuestion.text}
                    </h1>

                    <div className="w-full space-y-3 mt-4">
                        {(['sim', 'não', 'nao_se_aplica'] as Answer[]).map(answer => (
                            <button
                                key={answer}
                                onClick={() => handleAnswer(currentQuestion.id, answer)}
                                className={`w-full py-3.5 rounded-lg font-bold transition shadow-sm border flex items-center justify-center gap-2 text-sm sm:text-base
                                ${currentAnswer === answer
                                        ? 'bg-blue-800 text-white border-white ring-2 ring-blue-400'
                                        : 'bg-blue-500 hover:bg-blue-400 text-white border-blue-400/30'}`}
                            >
                                {currentAnswer === answer && <CheckIcon className="w-5 h-5" />} {answer.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setActiveAlertQuestion(currentQuestion)}
                        className="mt-4 sm:mt-6 flex items-center gap-2 text-red-100 hover:text-white bg-red-900/40 hover:bg-red-600/80 px-4 sm:px-5 py-2.5 rounded-full transition text-xs font-bold border border-red-400/30 tracking-wide"
                    >
                        <AlertIcon className="w-4 h-4" />
                        GERAR ALERTA / INTERVENÇÃO
                    </button>
                </div>

                {/* Footer Navigation */}
                <div className="p-4 sm:p-6 border-t border-blue-500/30 flex justify-between items-center bg-blue-700/20">
                    <button
                        onClick={handlePrevious} disabled={currentQuestionIndex === 0}
                        className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed text-blue-300' : 'bg-blue-800/50 hover:bg-blue-800 text-blue-100 hover:text-white'}`}
                    >
                        <ChevronLeftIcon className="w-4 h-4" /> Anterior
                    </button>

                    <button
                        onClick={handleNext}
                        className={`px-6 sm:px-8 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition shadow-lg flex items-center gap-2 bg-white hover:bg-gray-100 text-blue-700`}
                    >
                        {currentQuestionIndex === categoryQuestions.length - 1 ? 'Salvar' : 'Próximo'} <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Alert Modal */}
            {activeAlertQuestion && patientId && (
                <Suspense fallback={null}>
                    <AlertModal
                        question={activeAlertQuestion}
                        onClose={() => setActiveAlertQuestion(null)}
                        patientId={patientId}
                    />
                </Suspense>
            )}
        </div>
    );
};
