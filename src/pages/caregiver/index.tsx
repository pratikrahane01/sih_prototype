import React, { useState, useEffect } from 'react';
import { PatientService } from '../../services/api/PatientService';
import { MemoryService } from '../../services/api/MemoryService';
import { CaregiverAnalyticsService } from '../../services/api/CaregiverAnalyticsService';
import { ActivityInsightService } from '../../services/api/ActivityInsightService';
import { LanguageService, SpeechRecognitionService } from '../../services/accessibility';
import type { GameAttempt, PersonalMemory, MemoryCategory } from '../../types';
import { Link } from 'react-router-dom';
import { Activity, Brain, Clock, Target, ArrowUpRight, ArrowRight, BrainCircuit, Map as MapIcon, ChevronRight, AlertTriangle } from 'lucide-react';

export const CaregiverDashboard: React.FC = () => {
  const patientId = PatientService.getProfile()?.id || 'demo-patient';
  const patientName = PatientService.getProfile()?.name || 'Patient';

  const overview = CaregiverAnalyticsService.getOverview(patientId);
  const domainPerformance = CaregiverAnalyticsService.getDomainPerformance(patientId);
  const insights = ActivityInsightService.getDomainInsights(patientId);
  const [recentActivities, setRecentActivities] = useState<GameAttempt[]>([]);
  const [adaptiveData, setAdaptiveData] = useState<any>(null);
  const memoryStatus = CaregiverAnalyticsService.getMemoryAssistantStatus(patientId);
  const routeStatus = CaregiverAnalyticsService.getFamiliarRoutesStatus(patientId);

  useEffect(() => {
    setRecentActivities(CaregiverAnalyticsService.getRecentActivities(patientId, 5));
    CaregiverAnalyticsService.getLatestAdaptiveRecommendation(patientId).then(setAdaptiveData);
  }, [patientId]);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Good morning, Caregiver</h1>
        <p className="text-lg text-gray-600">Here's how today's activities are going for <span className="font-semibold text-primary-teal">{patientName}</span>.</p>
      </div>

      {/* SECTION 1 — TODAY'S OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 font-medium">Activities Completed</h3>
            <div className="p-2 bg-blue-50 rounded-lg"><Activity className="w-5 h-5 text-ai-blue" /></div>
          </div>
          <p className="text-4xl font-bold text-gray-900">{overview.activitiesCompleted}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 font-medium">Average Accuracy</h3>
            <div className="p-2 bg-secondary-sage/20 rounded-lg"><Target className="w-5 h-5 text-secondary-sage" /></div>
          </div>
          <p className="text-4xl font-bold text-gray-900">{overview.averageAccuracy}%</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 font-medium">Avg Response Time</h3>
            <div className="p-2 bg-amber-50 rounded-lg"><Clock className="w-5 h-5 text-attention-amber" /></div>
          </div>
          <p className="text-4xl font-bold text-gray-900">{overview.averageResponseTime}s</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 font-medium">Current Difficulty</h3>
            <div className="p-2 bg-gray-100 rounded-lg"><ArrowUpRight className="w-5 h-5 text-gray-600" /></div>
          </div>
          <p className="text-4xl font-bold text-gray-900">{overview.averageDifficulty}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SECTION 2 — ACTIVITY PERFORMANCE */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Performance by Domain</h2>
          {domainPerformance.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No activity data yet.
            </div>
          ) : (
            <div className="space-y-6">
              {domainPerformance.map(dp => (
                <div key={dp.domain}>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-gray-700 capitalize">{dp.domain.replace('_', ' ')}</span>
                    <span className="text-primary-teal">{dp.averageAccuracy}% Accuracy</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-primary-teal h-3 rounded-full transition-all duration-1000" 
                      style={{ width: `${dp.averageAccuracy}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{dp.attempts} completed activities</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 5 — ADAPTIVE INTELLIGENCE PANEL */}
        <div className="bg-[#f0f6fa] rounded-3xl border border-[#d6e8f4] shadow-sm p-8 flex flex-col">
          <div className="flex items-center text-ai-blue mb-4">
            <BrainCircuit className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold">Adaptive Activity Engine</h2>
          </div>
          
          {adaptiveData ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-6">
                  Based on recent performance in <span className="font-semibold capitalize">{adaptiveData.domain.replace('_', ' ')}</span>.
                </p>
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl mb-4 border border-[#d6e8f4]">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Previous</p>
                    <p className="text-2xl font-bold text-gray-700">Diff {adaptiveData.previousDifficulty}</p>
                  </div>
                  <ArrowRight className="text-ai-blue w-6 h-6" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 text-ai-blue font-bold">Recommended</p>
                    <p className="text-2xl font-bold text-ai-blue">Diff {adaptiveData.recommendedDifficulty}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#d6e8f4]">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Reason:</span> Activity accuracy was {adaptiveData.recentAccuracy}%. The difficulty has been automatically adjusted to maintain the optimal cognitive challenge.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#d6e8f4]/50">
                <span className="text-xs font-bold text-ai-blue/60 uppercase tracking-widest">Adaptive Engine — Prototype</span>
              </div>
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-center p-4">
                <p className="text-sm text-gray-500">Adaptive recommendation will appear after enough activity data is available.</p>
             </div>
          )}
        </div>
      </div>

      {/* SECTION 10 — ACTIVITY PATTERN INSIGHTS */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-primary-teal" />
          Activity Pattern Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map(insight => {
            let bgColor = 'bg-gray-50';
            let borderColor = 'border-gray-200';
            let textColor = 'text-gray-600';
            let statusText = 'Not enough data';

            if (insight.status === 'stable') {
              bgColor = 'bg-secondary-sage/10';
              borderColor = 'border-secondary-sage/30';
              textColor = 'text-secondary-sage';
              statusText = 'Stable';
            } else if (insight.status === 'watch') {
              bgColor = 'bg-amber-50';
              borderColor = 'border-attention-amber/30';
              textColor = 'text-attention-amber';
              statusText = 'Watch';
            } else if (insight.status === 'notable_change') {
              bgColor = 'bg-red-50';
              borderColor = 'border-red-200';
              textColor = 'text-red-600';
              statusText = 'Recent change detected';
            }

            return (
              <div key={insight.domain} className={`p-6 rounded-2xl border ${bgColor} ${borderColor}`}>
                <h3 className="text-lg font-bold text-gray-900 capitalize mb-1">{insight.domain.replace('_', ' ')}</h3>
                <p className={`text-sm font-semibold mb-4 ${textColor}`}>{statusText}</p>
                {insight.status !== 'insufficient_data' && (
                  <p className="text-sm text-gray-700">{insight.explanation}</p>
                )}
                {insight.status === 'insufficient_data' && (
                  <p className="text-sm text-gray-500">More activity data is needed to identify a reliable pattern.</p>
                )}
              </div>
            );
          })}
        </div>
        
        {insights.some(i => i.status === 'notable_change') && (
          <div className="mt-8 bg-amber-50 border border-attention-amber/30 p-4 rounded-xl flex items-start">
            <AlertTriangle className="w-6 h-6 text-attention-amber mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-800">
              <span className="font-semibold text-attention-amber block mb-1">Activity attention</span>
              Activity pattern changes can happen for many reasons. This information is not a medical diagnosis. If you have concerns about the patient's health or memory, consult a qualified healthcare professional.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SECTION 3 — RECENT ACTIVITY */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-primary-teal font-medium hover:underline">View All</button>
          </div>
          
          {recentActivities.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Activities will appear here after the patient completes an activity.
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                      {activity.domain === 'route_recall' ? <MapIcon className="w-5 h-5 text-gray-600" /> : <Brain className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{CaregiverAnalyticsService.getGameName(activity.gameId, activity.domain)}</p>
                      <p className="text-sm text-gray-500 capitalize">{activity.domain.replace('_', ' ')} • Diff {activity.difficulty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-teal">{Math.round(activity.accuracy * 100)}% Accuracy</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 13 & 14 — PERSONALIZATION STATUS */}
        <div className="space-y-6">
          {/* AI Memory Assistant Status */}
          <Link to="/caregiver/family" className="block bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-900">AI Memory Assistant</h3>
              <ChevronRight className="text-gray-400 group-hover:text-primary-teal" />
            </div>
            {memoryStatus.savedMemories > 0 ? (
              <div>
                <p className="text-3xl font-bold text-primary-teal mb-1">{memoryStatus.savedMemories}</p>
                <p className="text-sm text-gray-500 mb-4">Saved Personal Memories</p>
                <p className="text-xs text-secondary-sage font-medium bg-secondary-sage/10 inline-block px-2 py-1 rounded">Personal memory support is active.</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No personal memories added yet.</p>
            )}
          </Link>

          {/* Familiar Routes Status */}
          <Link to="/caregiver/routes" className="block bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-900">Familiar Routes</h3>
              <ChevronRight className="text-gray-400 group-hover:text-primary-teal" />
            </div>
            {routeStatus.routesConfigured > 0 ? (
              <div>
                <p className="text-3xl font-bold text-primary-teal mb-1">{routeStatus.routesConfigured}</p>
                <p className="text-sm text-gray-500 mb-4">Routes Configured</p>
                {routeStatus.lastRouteActivity && (
                  <p className="text-xs text-gray-500 border-t pt-3 mt-1">Last active: <span className="font-medium text-gray-700">{routeStatus.lastRouteActivity}</span></p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No familiar routes configured.</p>
            )}
          </Link>

          {/* Language and Voice Status */}
          <div className="block bg-white rounded-3xl border border-gray-100 shadow-sm p-6 group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-900">Language & Voice</h3>
            </div>
            <div>
              <p className="text-xl font-bold text-primary-teal mb-1 capitalize">
                {LanguageService.getLanguageConfig(LanguageService.getCurrentLanguageCode())?.name || 'English'}
              </p>
              <p className="text-sm text-gray-500 mb-4">Preferred Language</p>
              
              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-700 font-medium mb-1">Voice Assistance</p>
                {LanguageService.isVoiceModeEnabled() ? (
                  SpeechRecognitionService.isSupported() ? (
                    <p className="text-xs text-secondary-sage font-medium bg-secondary-sage/10 inline-block px-2 py-1 rounded">Enabled & Supported</p>
                  ) : (
                    <p className="text-xs text-attention-amber font-medium bg-amber-50 inline-block px-2 py-1 rounded border border-attention-amber/20">Enabled (Browser Unsupported)</p>
                  )
                ) : (
                  <p className="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded">Disabled</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PatientsList: React.FC = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Patients</h1>
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">Patient List Placeholder</div>
      <div className="p-4 text-gray-500">No patients configured yet.</div>
    </div>
  </div>
);

export const SinglePatient: React.FC = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Patient Overview</h1>
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p>Performance metrics will be displayed here.</p>
    </div>
  </div>
);

export const FamilyManager: React.FC = () => {
  const [memories, setMemories] = useState<PersonalMemory[]>([]);
  const [category, setCategory] = useState<MemoryCategory>('person');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const patientId = PatientService.getProfile()?.id || 'demo-patient';

  useEffect(() => {
    setMemories(MemoryService.getPatientMemories(patientId));
  }, [patientId]);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    MemoryService.addMemory({
      patientId,
      category,
      title,
      content
    });

    setTitle('');
    setContent('');
    setMemories(MemoryService.getPatientMemories(patientId));
  };

  const handleDelete = (id: string) => {
    MemoryService.deleteMemory(id);
    setMemories(MemoryService.getPatientMemories(patientId));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Patient Memories</h1>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary-teal">Add New Memory</h2>
        <form onSubmit={handleAddMemory} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value as MemoryCategory)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
            >
              <option value="person">Important Person</option>
              <option value="object">Important Object</option>
              <option value="place">Important Place</option>
              <option value="routine">Daily Routine</option>
              <option value="activity">Activity</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {category === 'person' ? 'Name' : category === 'object' ? 'Object Name' : category === 'place' ? 'Place Name' : 'Title'}
            </label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={category === 'person' ? 'e.g., Priya' : ''}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description / Detail
            </label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={category === 'person' ? 'e.g., Priya is my daughter.' : category === 'object' ? 'e.g., Glasses are kept on the bedside table.' : ''}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
              rows={3}
              required
            />
          </div>

          <button 
            type="submit" 
            className="bg-primary-teal text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition"
          >
            Save Memory
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Saved Memories</h2>
        {memories.length === 0 ? (
          <p className="text-gray-500">No memories saved yet.</p>
        ) : (
          <div className="space-y-4">
            {memories.map(memory => (
              <div key={memory.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-primary-teal uppercase tracking-wider mb-1 block">
                    {memory.category}
                  </span>
                  <h3 className="font-semibold text-gray-900">{memory.title}</h3>
                  <p className="text-gray-600 mt-1">{memory.content}</p>
                </div>
                <button 
                  onClick={() => handleDelete(memory.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import { RouteService } from '../../services/api/RouteService';
import type { FamiliarRoute, RouteLocation } from '../../types';

export const RouteManager: React.FC = () => {
  const [routes, setRoutes] = useState<FamiliarRoute[]>([]);
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [locations, setLocations] = useState<{name: string, description: string, landmark: string, direction: string}[]>([
    { name: '', description: '', landmark: '', direction: '' }
  ]);
  const patientId = PatientService.getProfile()?.id || 'demo-patient';

  useEffect(() => {
    setRoutes(RouteService.getPatientRoutes(patientId));
  }, [patientId]);

  const handleAddLocation = () => {
    setLocations([...locations, { name: '', description: '', landmark: '', direction: '' }]);
  };

  const handleLocationChange = (index: number, field: keyof typeof locations[0], value: string) => {
    const newLocations = [...locations];
    newLocations[index][field] = value;
    setLocations(newLocations);
  };

  const handleRemoveLocation = (index: number) => {
    if (locations.length <= 1) return;
    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
  };

  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName || locations.some(l => !l.name)) return;

    const mappedLocations: RouteLocation[] = locations.map((l, index) => ({
      id: crypto.randomUUID(),
      name: l.name,
      description: l.description,
      landmark: l.landmark,
      direction: l.direction,
      order: index
    }));

    RouteService.createRoute({
      patientId,
      name: routeName,
      description: routeDescription,
      locations: mappedLocations
    });

    setRouteName('');
    setRouteDescription('');
    setLocations([{ name: '', description: '', landmark: '', direction: '' }]);
    setRoutes(RouteService.getPatientRoutes(patientId));
  };

  const handleDelete = (id: string) => {
    RouteService.deleteRoute(id);
    setRoutes(RouteService.getPatientRoutes(patientId));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Familiar Routes</h1>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary-teal">Create New Route</h2>
        <form onSubmit={handleSaveRoute} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
              <input 
                type="text" 
                value={routeName}
                onChange={e => setRouteName(e.target.value)}
                placeholder="e.g., Home to Market"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input 
                type="text" 
                value={routeDescription}
                onChange={e => setRouteDescription(e.target.value)}
                placeholder="e.g., My usual route to the main market"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-teal focus:border-primary-teal"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Locations Sequence</h3>
            {locations.map((loc, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                <div className="absolute top-2 right-2 text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">
                  Stop {idx + 1}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Location Name *</label>
                    <input 
                      type="text" 
                      value={loc.name}
                      onChange={e => handleLocationChange(idx, 'name', e.target.value)}
                      placeholder="e.g., Home, Bus Stop"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                    <input 
                      type="text" 
                      value={loc.landmark}
                      onChange={e => handleLocationChange(idx, 'landmark', e.target.value)}
                      placeholder="e.g., Blue shelter"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                {locations.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveLocation(idx)}
                    className="mt-3 text-red-500 text-sm hover:underline"
                  >
                    Remove Stop
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={handleAddLocation}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              + Add Another Stop
            </button>
            <button 
              type="submit" 
              className="bg-primary-teal text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition"
            >
              Save Route
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Saved Routes</h2>
        {routes.length === 0 ? (
          <p className="text-gray-500">No routes configured yet.</p>
        ) : (
          <div className="space-y-4">
            {routes.map(route => (
              <div key={route.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{route.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{route.description}</p>
                  <div className="flex items-center text-xs text-gray-500 gap-2">
                    {route.locations.map((l, i) => (
                      <span key={l.id} className="flex items-center">
                        <span className="font-medium text-primary-teal">{l.name}</span>
                        {i < route.locations.length - 1 && <span className="mx-2">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(route.id)}
                  className="text-red-500 text-sm hover:underline ml-4"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ReminderManager: React.FC = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-6">Reminders</h1>
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p>Configure daily reminders for the patient.</p>
    </div>
  </div>
);

export * from './MemoriesManager';
