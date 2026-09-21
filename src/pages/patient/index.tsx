import React, { useEffect, useState } from 'react';
import { PatientService } from '../../services/api/PatientService';
import type { Patient } from '../../types';
import { Link, useParams } from 'react-router-dom';
import { GameRegistry } from '../../data/GameRegistry';
import { GameEngine } from '../../components/engine/GameEngine';
import { Brain, Star, Activity, Clock, Play, Calendar, Heart, TrendingUp, AlertCircle, Map } from 'lucide-react';
import { CaregiverAnalyticsService } from '../../services/api/CaregiverAnalyticsService';
import { ActivityInsightService } from '../../services/api/ActivityInsightService';
import { useLanguage } from '../../contexts/LanguageContext';
import nerHero from '../../assets/cultural/ner-hero.jpg';
import nerBanner from '../../assets/cultural/ner-banner.jpg';
import moreActivitiesPoster from '../../assets/games/more_games_poster.jpg';
import insightsHero from '../../assets/cultural/insights-hero.jpg';

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Brain': return Brain;
    case 'Star': return Star;
    case 'Activity': return Activity;
    case 'Map': return Map;
    default: return Brain;
  }
};

const ActivityCard = ({ icon: Icon, title, description, to, bgColor, poster }: any) => (
  <Link to={to} className={`rounded-[24px] p-4 sm:p-5 flex flex-col justify-between transition-transform transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md border border-white/50 min-h-[160px] sm:min-h-[180px] ${bgColor}`}>
    {poster ? (
      <div className="mb-3 relative w-full aspect-video rounded-[18px] overflow-hidden shadow-sm shrink-0">
        <img src={poster} alt={`${title} activity illustration`} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 backdrop-blur-md shadow-sm">
          <Play className="w-3 h-3 sm:w-4 sm:h-4 text-text-charcoal ml-[1px]" />
        </div>
      </div>
    ) : (
      <div className="flex justify-between items-start mb-3">
        <div className="bg-white/90 rounded-[18px] p-3 text-text-charcoal shadow-sm">
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 stroke-2" />
        </div>
        <div className="bg-white/60 rounded-full p-1.5">
          <Play className="w-3 h-3 sm:w-4 sm:h-4 text-text-charcoal/60 ml-[1px]" />
        </div>
      </div>
    )}
    <div className="flex-grow flex flex-col justify-end">
      <h4 className="text-[17px] sm:text-xl font-bold text-text-charcoal leading-tight mb-1">{title}</h4>
      <p className="text-text-charcoal/70 text-[12px] sm:text-sm leading-snug font-medium">{description}</p>
    </div>
  </Link>
);

// Map games to pastel colors
const getColor = (domain: string) => {
  switch (domain) {
    case 'memory': return 'bg-[#FFE8E8]'; // Soft pink
    case 'attention': return 'bg-[#E8F0FE]'; // Soft blue
    case 'pattern': return 'bg-[#FFF3E0]'; // Soft amber
    case 'spatial': return 'bg-[#E8F5E9]'; // Soft sage/green
    default: return 'bg-[#F3E5F5]'; // Soft lavender
  }
};

export const PatientHome: React.FC = () => {
  const [profile, setProfile] = useState<Patient | null>(null);
  const { t } = useLanguage();
  
  useEffect(() => {
    setProfile(PatientService.getProfile());
  }, []);

  const displayName = profile?.nickname || profile?.name || 'Friend';

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8 mt-2 md:mt-4">
      {/* Greeting Section with Regional Hero Illustration */}
      <section className="relative w-full rounded-[32px] overflow-hidden min-h-[180px] md:min-h-[220px] flex items-center shadow-sm">
        <img src={nerHero} alt="Regional landscape" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
        <div className="relative z-10 p-6 md:p-10 w-full md:w-2/3">
          <h2 className="text-3xl sm:text-4xl md:text-[3.5rem] font-bold text-primary-teal mb-2 leading-tight">{t('home.greeting')},<br/>{displayName}</h2>
          <p className="text-[17px] sm:text-lg md:text-2xl text-text-charcoal/80 font-medium">{t('home.subtitle')}</p>
        </div>
      </section>

      {/* Personalized Activities Section */}
      <section className="bg-white rounded-[32px] p-5 sm:p-6 md:p-10 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500/20 via-red-600/30 to-red-500/20"></div>
        
        <div className="flex flex-col mb-5 md:mb-8 pl-3">
          <h3 className="text-[1.5rem] sm:text-[1.75rem] md:text-3xl font-bold text-text-charcoal flex items-center gap-3">
            <Heart className="w-7 h-7 md:w-8 md:h-8 text-primary-teal" />
            {t('home.personalizedActivities')}
          </h3>
          <p className="text-[14px] sm:text-[15px] md:text-lg text-text-charcoal/60 font-medium mt-1">{t('home.personalizedActivitiesDesc')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {GameRegistry.filter(g => g.id === 'who-is-this' || g.id === 'favorite-song').map(game => (
            <ActivityCard
              key={game.id}
              icon={getIconComponent(game.icon)}
              title={t(game.titleKey, game.name)}
              description={t(game.descriptionKey, game.description)}
              to={`/patient/game/${game.id}`}
              bgColor={getColor(game.domain)}
              poster={game.poster}
            />
          ))}
          <ActivityCard
            icon={Activity}
            title={t('home.moreGames')}
            description={t('home.exploreActivities')}
            to="/patient/games"
            bgColor="bg-[#E8F5E9]" // Soft green
            poster={moreActivitiesPoster}
          />
        </div>
      </section>

      {/* Quick Info & Care */}
      <section className="bg-white rounded-[32px] p-5 sm:p-6 md:p-10 shadow-sm border border-gray-100">
        <div className="flex flex-col mb-5 md:mb-8 pl-1">
          <h3 className="text-[1.5rem] sm:text-[1.75rem] md:text-3xl font-bold text-text-charcoal flex items-center gap-3">
            <div className="bg-primary-teal text-white p-1.5 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 fill-current" />
            </div>
            {t('home.quickInfo')}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Daily Routine */}
          <Link to="/patient/routine" className="bg-[#E8F0FE] rounded-[24px] p-4 sm:p-5 flex flex-col items-start hover:shadow-md transition-shadow group relative min-h-[140px] sm:min-h-[160px]">
            <div className="bg-white rounded-[16px] p-3 text-ai-blue shadow-sm mb-3 group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 stroke-2" />
            </div>
            <h4 className="text-[16px] sm:text-[1.25rem] font-bold text-text-charcoal leading-tight mb-1">{t('home.dailyRoutine')}</h4>
            <p className="text-text-charcoal/70 text-[12px] sm:text-sm font-medium pr-4 sm:pr-6">{t('home.viewRoutine')}</p>
            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-text-charcoal/40 absolute bottom-4 right-4 group-hover:text-primary-teal transition-colors" />
          </Link>
          
          {/* Diet Preference */}
          <Link to="/patient/diet" className="bg-[#E8F5E9] rounded-[24px] p-4 sm:p-5 flex flex-col items-start hover:shadow-md transition-shadow group relative min-h-[140px] sm:min-h-[160px]">
            <div className="bg-white rounded-[16px] p-3 text-secondary-sage shadow-sm mb-3 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 stroke-2" />
            </div>
            <h4 className="text-[16px] sm:text-[1.25rem] font-bold text-text-charcoal leading-tight mb-1">{t('home.dietPreference')}</h4>
            <p className="text-text-charcoal/70 text-[12px] sm:text-sm font-medium pr-4 sm:pr-6">{t('home.foodPreferences')}</p>
            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-text-charcoal/40 absolute bottom-4 right-4 group-hover:text-primary-teal transition-colors" />
          </Link>

          {/* Recent Activity */}
          <Link to="/patient/games" className="bg-[#FFF3E0] rounded-[24px] p-4 sm:p-5 flex flex-col items-start hover:shadow-md transition-shadow group relative min-h-[140px] sm:min-h-[160px]">
            <div className="bg-white rounded-[16px] p-3 text-attention-amber shadow-sm mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 stroke-2" />
            </div>
            <h4 className="text-[16px] sm:text-[1.25rem] font-bold text-text-charcoal leading-tight mb-1">{t('home.recentActivity')}</h4>
            <p className="text-text-charcoal/70 text-[12px] sm:text-sm font-medium pr-4 sm:pr-6">{t('home.viewPastSessions')}</p>
            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-text-charcoal/40 absolute bottom-4 right-4 group-hover:text-primary-teal transition-colors" />
          </Link>
        </div>
      </section>

      {/* Motivational Banner */}
      <section className="relative w-full rounded-[28px] overflow-hidden min-h-[130px] sm:min-h-[160px] flex items-center justify-center shadow-sm mb-6 border border-white/50">
        <img src={nerBanner} alt="Regional support banner" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/15"></div>
        <div className="relative z-10 p-5 sm:p-6 text-center w-full">
          <h4 className="text-[20px] sm:text-2xl md:text-3xl font-serif italic text-white drop-shadow-lg tracking-wide leading-snug">
            {t('home.motivationalBanner', '"A healthier mind leads to a brighter tomorrow"')}
          </h4>
          <div className="w-10 sm:w-12 h-1 bg-white/70 mx-auto mt-3 sm:mt-4 rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export const GamesList: React.FC = () => {
  const { t } = useLanguage();

  const personalGames = GameRegistry.filter(g => g.category === 'personalized');
  const cognitiveGames = GameRegistry.filter(g => g.category === 'general');

  return (
    <div className="w-full flex flex-col items-center px-4 md:px-0">
      
      {/* SECTION 1: Personal Memories */}
      <div className="mb-6 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-primary-teal mb-2">{t('home.personalizedActivities')}</h2>
        <p className="text-lg text-text-charcoal/80 mb-6 font-medium">{t('home.personalizedActivitiesDesc')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full">
          {personalGames.map(game => (
            <ActivityCard
              key={game.id}
              icon={getIconComponent(game.icon)}
              title={t(game.titleKey, game.name)}
              description={t(game.descriptionKey, game.description)}
              to={`/patient/game/${game.id}`}
              bgColor={getColor(game.domain)}
              poster={game.poster}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-4xl h-px bg-gray-200 my-8"></div>

      {/* SECTION 2: Cognitive Activities */}
      <div className="mb-6 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-primary-teal mb-2">{t('home.generalCognitiveActivities')}</h2>
        <p className="text-lg text-text-charcoal/80 mb-6 font-medium">{t('home.generalCognitiveActivitiesDesc')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full">
          {cognitiveGames.map(game => (
            <ActivityCard
              key={game.id}
              icon={getIconComponent(game.icon)}
              title={t(game.titleKey, game.name)}
              description={t(game.descriptionKey, game.description)}
              to={`/patient/game/${game.id}`}
              bgColor={getColor(game.domain)}
              poster={game.poster}
            />
          ))}
        </div>
      </div>

    </div>
  );
};


import { AdaptiveEngine } from '../../services/ai';

export const SingleGame: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const game = GameRegistry.find(g => g.id === id);
  const [difficulty, setDifficulty] = useState<number | null>(null);

  useEffect(() => {
    const fetchDifficulty = async () => {
      if (!game) return;
      
      const patient = PatientService.getProfile();
      if (!patient) return;

      const recommendation = await AdaptiveEngine.getRecommendedDifficulty(patient.id, game.domain, game.id);
      setDifficulty(recommendation.recommendedDifficulty);
    };

    fetchDifficulty();
  }, [game]);

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Activity Not Found</h2>
        <Link to="/patient/games" className="text-primary-teal underline text-xl">Return to Activities</Link>
      </div>
    );
  }

  if (difficulty === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center w-full">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
            <Brain className="w-12 h-12 text-ai-blue animate-bounce" />
          </div>
          <div className="absolute inset-0 border-4 border-ai-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-3xl font-bold text-primary-teal mb-4">Personalizing Activity</h2>
        <p className="text-xl text-text-charcoal/70 max-w-sm">
          Smaran Sarathii is analyzing your past performance to find the perfect difficulty level for you...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GameEngine game={game} difficulty={difficulty} />
    </div>
  );
};

export const Insights: React.FC = () => {
  const patientId = PatientService.getProfile()?.id || 'demo-patient';
  const overview = CaregiverAnalyticsService.getOverview(patientId);
  const domainPerformance = CaregiverAnalyticsService.getDomainPerformance(patientId);
  const insights = ActivityInsightService.getDomainInsights(patientId);
  const { t } = useLanguage();
  
  return (
    <div className="w-full flex flex-col items-center px-4 md:px-0 pb-10 mt-2 md:mt-4 space-y-6 md:space-y-8">
      {/* Insights Hero Section */}
      <section className="relative w-full max-w-4xl rounded-[32px] overflow-hidden min-h-[180px] md:min-h-[220px] flex items-center shadow-sm">
        <img src={insightsHero} alt="Your Insights" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
        <div className="relative z-10 p-6 md:p-10 w-full md:w-2/3">
          <h2 className="text-3xl sm:text-4xl md:text-[3.5rem] font-bold text-primary-teal mb-2 leading-tight">{t('insights.title')}</h2>
          <p className="text-[17px] sm:text-lg md:text-2xl text-text-charcoal/80 font-medium">{t('insights.subtitle')}</p>
        </div>
      </section>

      <div className="w-full max-w-4xl space-y-8">
        
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="bg-blue-50 p-4 rounded-2xl mb-4">
              <Activity className="w-10 h-10 text-ai-blue" />
            </div>
            <h3 className="text-gray-500 font-medium text-lg mb-1">{t('insights.activitiesCompleted')}</h3>
            <p className="text-5xl font-bold text-text-charcoal">{overview.activitiesCompleted}</p>
          </div>
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="bg-secondary-sage/10 p-4 rounded-2xl mb-4">
              <Star className="w-10 h-10 text-secondary-sage" />
            </div>
            <h3 className="text-gray-500 font-medium text-lg mb-1">{t('insights.averageAccuracy')}</h3>
            <p className="text-5xl font-bold text-text-charcoal">{overview.averageAccuracy}%</p>
          </div>
          <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="bg-attention-amber/10 p-4 rounded-2xl mb-4">
              <Clock className="w-10 h-10 text-attention-amber" />
            </div>
            <h3 className="text-gray-500 font-medium text-lg mb-1">{t('insights.responseTime')}</h3>
            <p className="text-5xl font-bold text-text-charcoal">{overview.averageResponseTime}s</p>
          </div>
        </div>

        {/* Activity Performance Trend */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
          <h3 className="text-2xl font-bold text-text-charcoal mb-6 flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-primary-teal" />
            {t('insights.activityPerformance')}
          </h3>
          {domainPerformance.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-lg">
              {t('insights.notEnoughData')}
            </div>
          ) : (
            <div className="space-y-6">
              {domainPerformance.map(dp => {
                if (dp.domain === 'route_recall') return null; // Ensure Route Recall is hidden if present
                
                return (
                  <div key={dp.domain}>
                    <div className="flex justify-between text-lg font-medium mb-3">
                      <span className="text-text-charcoal font-bold capitalize">{dp.domain.replace('_', ' ')}</span>
                      <span className="text-primary-teal font-bold">{dp.averageAccuracy}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-primary-teal h-4 rounded-full transition-all duration-1000" 
                        style={{ width: `${dp.averageAccuracy}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity Pattern */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
          <h3 className="text-2xl font-bold text-text-charcoal mb-6 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-primary-teal" />
            {t('insights.recentActivity')}
          </h3>
          <div className="space-y-4">
            {insights.filter(i => i.domain !== 'route_recall').map(insight => {
              let bgColor = 'bg-gray-50';
              let textColor = 'text-gray-600';
              let statusText = t('insights.notEnoughData');

              if (insight.status === 'stable') {
                bgColor = 'bg-secondary-sage/10';
                textColor = 'text-secondary-sage';
                statusText = t('insights.stable');
              } else if (insight.status === 'watch') {
                bgColor = 'bg-amber-50';
                textColor = 'text-attention-amber';
                statusText = t('insights.watch');
              } else if (insight.status === 'notable_change') {
                bgColor = 'bg-blue-50';
                textColor = 'text-ai-blue';
                statusText = t('insights.recentChange');
              }

              return (
                <div key={insight.domain} className={`p-6 rounded-3xl ${bgColor} flex flex-col md:flex-row justify-between items-start md:items-center`}>
                  <div>
                    <h4 className="text-xl font-bold text-text-charcoal capitalize mb-1">{insight.domain.replace('_', ' ')}</h4>
                    <p className={`text-lg font-semibold ${textColor}`}>{statusText}</p>
                  </div>
                  {insight.status !== 'insufficient_data' && (
                    <p className="text-gray-700 font-medium text-lg mt-3 md:mt-0 md:ml-6 max-w-md">
                      {insight.status === 'stable' ? t('insights.stableDesc') : 
                       insight.status === 'notable_change' ? t('insights.changeDesc') : 
                       t('insights.watchDesc')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          
          {insights.some(i => i.status === 'notable_change') && (
            <div className="mt-8 bg-blue-50/50 p-6 rounded-2xl flex items-start">
              <AlertCircle className="w-8 h-8 text-ai-blue mr-4 flex-shrink-0 mt-1" />
              <p className="text-lg text-text-charcoal/80 font-medium leading-relaxed">
                {t('insights.consultDisclaimer')}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

