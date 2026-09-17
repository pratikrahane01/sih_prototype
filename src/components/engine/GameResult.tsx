import React from 'react';
import type { GameSession } from '../../types';
import { Award, Target, Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  session: GameSession;
  onContinue: () => void;
}

export const GameResult: React.FC<Props> = ({ session, onContinue }) => {
  const { t } = useLanguage();
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 w-full text-center">
        <div className="w-24 h-24 bg-primary-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-12 h-12 text-primary-teal" />
        </div>
        <h2 className="text-4xl font-bold text-primary-teal mb-2">{t('game.activity_complete')}</h2>
        <p className="text-xl text-text-charcoal/70 mb-10">Here is your activity performance.</p>

        <div className="grid grid-cols-2 gap-6 mb-10 text-left">
          <div className="bg-gray-50 p-6 rounded-2xl flex items-center space-x-4 border border-gray-100">
            <Award className="w-8 h-8 text-primary-teal opacity-70" />
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('game.score')}</p>
              <p className="text-2xl font-bold text-text-charcoal">{session.score ? Math.round(session.score) : 0}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-2xl flex items-center space-x-4 border border-gray-100">
            <Target className="w-8 h-8 text-ai-blue opacity-70" />
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('game.accuracy')}</p>
              <p className="text-2xl font-bold text-text-charcoal">{session.accuracy ? Math.round(session.accuracy) : 0}%</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl flex items-center space-x-4 border border-gray-100">
            <Clock className="w-8 h-8 text-secondary-sage opacity-70" />
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('game.average_time')}</p>
              <p className="text-2xl font-bold text-text-charcoal">{session.averageResponseTime ? (session.averageResponseTime / 1000).toFixed(1) : 0}s</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl flex items-center space-x-4 border border-gray-100">
            <AlertTriangle className="w-8 h-8 text-attention-amber opacity-70" />
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('game.mistakes')}</p>
              <p className="text-2xl font-bold text-text-charcoal">{session.mistakes || 0}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onContinue}
          className="bg-primary-teal text-white w-full py-5 rounded-2xl text-2xl font-semibold hover:bg-teal-700 transition"
        >
          {t('game.continue')}
        </button>
      </div>
    </div>
  );
};
