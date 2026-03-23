'use client';

import { useState } from 'react';
import { toggleExerciseCompletion } from './actions';
import { CheckCircle, Circle, PlayCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function ExerciseCard({ exercise, workoutId }: { exercise: any, workoutId: string }) {
    const [loading, setLoading] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    const isCompleted = exercise.isCompleted;

    async function handleToggle() {
        setLoading(true);
        const formData = new FormData();
        formData.append('exerciseId', exercise.id);
        formData.append('workoutId', workoutId);
        formData.append('isCompleted', isCompleted.toString());

        try {
            const res = await toggleExerciseCompletion(formData);
            if (res && !res.success) toast.error(res.error);
        } catch (e) {
            toast.error('Erro ao marcar');
        } finally {
            setLoading(false);
        }
    }

    // Youtube Embed Extractor
    let embedUrl = null;
    if (exercise.exercise.videoUrl) {
        const vUrl = exercise.exercise.videoUrl;
        if (vUrl.includes('youtube.com/watch?v=')) {
            embedUrl = `https://www.youtube.com/embed/${new URL(vUrl).searchParams.get('v')}`;
        } else if (vUrl.includes('youtu.be/')) {
            embedUrl = `https://www.youtube.com/embed/${vUrl.split('youtu.be/')[1].split('?')[0]}`;
        }
    }

    return (
        <div className={`bg-neutral-900 border rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${isCompleted ? 'border-emerald-500/50 bg-neutral-900/60' : 'border-neutral-800'}`}>
            <div className="p-5 flex gap-4">
                {/* Toggle Button */}
                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className="shrink-0 mt-1 focus:outline-none"
                >
                    {isCompleted ? (
                        <CheckCircle className="text-emerald-500 hover:text-emerald-400 transition-colors" size={28} />
                    ) : (
                        <Circle className="text-neutral-500 hover:text-white transition-colors" size={28} />
                    )}
                </button>

                {/* Content */}
                <div className={`flex-1 transition-opacity ${isCompleted ? 'opacity-50' : 'opacity-100'}`}>
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight">{exercise.exercise.name}</h3>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3">
                        <div>
                            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Séries x Reps</span>
                            <p className="text-white font-semibold text-lg">{exercise.sets} <span className="text-neutral-400 font-normal mx-1">x</span> {exercise.reps}</p>
                        </div>
                        {(exercise.load || exercise.restTime) && (
                            <div>
                                <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Detalhes</span>
                                <p className="text-white font-semibold text-sm mt-1">
                                    {exercise.load && <span>{exercise.load}</span>}
                                    {exercise.load && exercise.restTime && <span className="text-neutral-600 mx-2">|</span>}
                                    {exercise.restTime && <span>{exercise.restTime}s rest</span>}
                                </p>
                            </div>
                        )}
                    </div>

                    {(exercise.notes || exercise.exercise.instructions) && (
                        <div className="mt-4 bg-neutral-950 p-3 rounded-lg border border-neutral-800/60 flex items-start gap-3">
                            <Info size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-neutral-300">
                                {exercise.notes && <p><span className="text-white font-medium">Obs Personal:</span> {exercise.notes}</p>}
                                {exercise.exercise.instructions && <p className={exercise.notes ? "mt-2 pt-2 border-t border-neutral-800/60" : ""}><span className="text-white font-medium">Instrução:</span> {exercise.exercise.instructions}</p>}
                            </div>
                        </div>
                    )}

                    {embedUrl && (
                        <button
                            onClick={() => setShowVideo(!showVideo)}
                            className="mt-4 flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <PlayCircle size={16} className="mr-1.5" /> {showVideo ? 'Ocultar Vídeo' : 'Ver Execução em Vídeo'}
                        </button>
                    )}
                </div>
            </div>

            {showVideo && embedUrl && (
                <div className="border-t border-neutral-800 aspect-video w-full bg-black relative">
                    <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )}
        </div>
    );
}
