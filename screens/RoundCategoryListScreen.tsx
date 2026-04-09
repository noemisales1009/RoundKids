
import React, { useMemo, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PatientsContext } from '../contexts';
import { useHeader } from '../hooks';

export const RoundCategoryListScreen: React.FC = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const { patients, questions, checklistAnswers, categories } = useContext(PatientsContext)!;
    const patient = patients.find(p => p.id.toString() === patientId);

    useHeader('Round: Categorias');

    if (!patientId || !patient) return <p>Paciente não encontrado.</p>;

    const completedCategories = useMemo(() => {
        if (!questions.length) return [];
        const answers = checklistAnswers[patientId] || {};
        return categories.filter(cat => {
            const catQuestions = questions.filter(q => q.categoryId === cat.id);
            if (catQuestions.length === 0) return false;
            return catQuestions.every(q => answers[q.id] !== undefined);
        }).map(c => c.id);
    }, [questions, checklistAnswers, patientId, categories]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(category => {
                const isCompleted = completedCategories.includes(category.id);
                return (
                    <Link
                        key={category.id}
                        to={`/patient/${patientId}/round/category/${category.id}`}
                        className={`p-4 rounded-xl shadow-sm text-center font-semibold transition flex flex-col items-center justify-center gap-2 ${isCompleted
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        {category.icon && <category.icon className={`w-8 h-8 ${isCompleted ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />}
                        <span className={isCompleted ? 'text-white' : 'text-slate-700 dark:text-slate-300'}>{category.name}</span>
                    </Link>
                )
            })}
        </div>
    );
};
