import React, { useEffect, useState } from 'react';
import { DietService } from '../../services/api/DietService';
import { PatientService } from '../../services/api/PatientService';
import { useLanguage } from '../../contexts/LanguageContext';
import type { DietPreference } from '../../types';
import { Heart, AlertCircle, Info } from 'lucide-react';

export const DietPreferenceView: React.FC = () => {
  const [diet, setDiet] = useState<DietPreference | null>(null);
  const patientId = PatientService.getProfile()?.id || 'demo-patient';
  const { t } = useLanguage();

  useEffect(() => {
    setDiet(DietService.getDietPreference(patientId));
  }, [patientId]);

  if (!diet) return null;

  return (
    <div className="w-full flex flex-col items-center px-4 md:px-0">
      <div className="mb-10 text-center w-full max-w-3xl">
        <h2 className="text-4xl font-bold text-primary-teal mb-4">{t('diet.title')}</h2>
        <p className="text-xl text-text-charcoal/80 font-medium">{t('diet.subtitle')}</p>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {/* Preferred Foods */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="bg-secondary-sage/10 p-3 rounded-2xl mr-4">
              <Heart className="w-8 h-8 text-secondary-sage" />
            </div>
            <h3 className="text-2xl font-bold text-text-charcoal">{t('diet.preferredFoods')}</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {diet.preferredFoods.map((food, idx) => (
              <div key={idx} className="bg-secondary-sage/10 text-secondary-sage px-6 py-3 rounded-full text-xl font-medium border border-secondary-sage/20">
                {food}
              </div>
            ))}
            {diet.preferredFoods.length === 0 && (
              <p className="text-lg text-gray-500">{t('diet.noPreferred')}</p>
            )}
          </div>
        </div>

        {/* Foods to Avoid */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="bg-red-50 p-3 rounded-2xl mr-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-text-charcoal">{t('diet.foodsToAvoid')}</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {diet.foodsToAvoid.map((food, idx) => (
              <div key={idx} className="bg-red-50 text-red-600 px-6 py-3 rounded-full text-xl font-medium border border-red-100">
                {food}
              </div>
            ))}
            {diet.foodsToAvoid.length === 0 && (
              <p className="text-lg text-gray-500">{t('diet.noAvoid')}</p>
            )}
          </div>
        </div>

        {/* Meal Notes */}
        {diet.mealNotes && (
          <div className="bg-blue-50 rounded-3xl p-6 md:p-8 border border-blue-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="bg-white p-2 rounded-xl mr-4 shadow-sm">
                <Info className="w-6 h-6 text-ai-blue" />
              </div>
              <h3 className="text-xl font-bold text-ai-blue">{t('diet.mealNotes')}</h3>
            </div>
            <p className="text-xl text-gray-700 leading-relaxed font-medium pl-14">
              {diet.mealNotes}
            </p>
          </div>
        )}

      </div>
      
      <div className="mt-12 max-w-2xl text-center px-4">
        <p className="text-sm text-gray-400">
          {t('diet.disclaimer')}
        </p>
      </div>
    </div>
  );
};
