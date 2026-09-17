import React, { useState, useEffect } from 'react';
import { MemoryService } from '../../services/api/MemoryService';
import { PatientService } from '../../services/api/PatientService';
import type { PersonalMemory, Person, MemoryCategory, MemoryType } from '../../types';
import { Plus, Edit2, Trash2, Image as ImageIcon, Users, Calendar, MapPin, Music, FlaskConical } from 'lucide-react';
import { DEMO_PATIENT_ID } from '../../services/demo/DemoMemoryData';

export const MemoriesManager: React.FC = () => {
  const [memories, setMemories] = useState<PersonalMemory[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isEditingMemory, setIsEditingMemory] = useState(false);
  const [isEditingPerson, setIsEditingPerson] = useState(false);
  const [currentMemory, setCurrentMemory] = useState<Partial<PersonalMemory>>({});
  const [currentPerson, setCurrentPerson] = useState<Partial<Person>>({});
  
  const [activeTab, setActiveTab] = useState<'People' | 'Places' | 'Life Events' | 'Songs' | 'Objects' | 'Childhood'>('People');

  const patientId = PatientService.getProfile()?.id || 'demo_patient_1';
  // Show demo badge when viewing data seeded from DemoMemoryData (no real caregiver entry exists)
  const isUsingDemoData = !PatientService.getProfile()?.id || patientId === DEMO_PATIENT_ID;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMemories(MemoryService.getPatientMemories(patientId));
    setPeople(MemoryService.getPatientPeople(patientId));
  };

  const categories: MemoryCategory[] = [
    'Family', 'Childhood', 'Marriage', 'Friends', 'Places', 'Travel', 'Important Moments'
  ];

  const memoryTypes: MemoryType[] = [
    'PLACE', 'EVENT', 'SONG', 'OBJECT', 'CHILDHOOD'
  ];

  // --- Person Handling ---
  const handleSavePerson = () => {
    if (!currentPerson.name || !currentPerson.relationship) {
      alert("Name and relationship are required.");
      return;
    }
    if (currentPerson.id) {
      // MemoryService does not have an updatePerson function yet, let's just delete and re-add or add it if missing
      MemoryService.deletePerson(currentPerson.id);
      MemoryService.addPerson({
        ...currentPerson,
        patientId,
        name: currentPerson.name,
        relationship: currentPerson.relationship
      } as any);
    } else {
      MemoryService.addPerson({
        ...currentPerson,
        patientId,
        name: currentPerson.name,
        relationship: currentPerson.relationship
      } as any);
    }
    setIsEditingPerson(false);
    setCurrentPerson({});
    loadData();
  };

  const handleDeletePerson = (id: string) => {
    if (window.confirm("Delete this person?")) {
      MemoryService.deletePerson(id);
      loadData();
    }
  };

  // --- Memory Handling ---
  const handleSaveMemory = () => {
    if (!currentMemory.title || !currentMemory.category || !currentMemory.type) {
      alert("Please provide a title, type, and category.");
      return;
    }

    if (currentMemory.id) {
      MemoryService.updateMemory(currentMemory.id, currentMemory);
    } else {
      MemoryService.addMemory({
        ...currentMemory,
        patientId,
        title: currentMemory.title,
        content: currentMemory.content || '',
        category: currentMemory.category,
        type: currentMemory.type
      } as any);
    }
    
    setIsEditingMemory(false);
    setCurrentMemory({});
    loadData();
  };

  const handleDeleteMemory = (id: string) => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      MemoryService.deleteMemory(id);
      loadData();
    }
  };

  // --- File Uploads ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isPerson: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isPerson) {
          setCurrentPerson(prev => ({ ...prev, image: reader.result as string }));
        } else {
          setCurrentMemory(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentMemory(prev => ({ ...prev, audioUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePerson = (personId: string) => {
    setCurrentMemory(prev => {
      const currentIds = prev.personIds || [];
      if (currentIds.includes(personId)) {
        return { ...prev, personIds: currentIds.filter(id => id !== personId) };
      } else {
        return { ...prev, personIds: [...currentIds, personId] };
      }
    });
  };

  // Filter memories by current tab type
  const getTypeForTab = (tab: string): MemoryType | null => {
    if (tab === 'Places') return 'PLACE';
    if (tab === 'Life Events') return 'EVENT';
    if (tab === 'Songs') return 'SONG';
    if (tab === 'Objects') return 'OBJECT';
    if (tab === 'Childhood') return 'CHILDHOOD';
    return null;
  };

  const activeMemories = activeTab === 'People' ? [] : memories.filter(m => m.type === getTypeForTab(activeTab));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900">Personal Memories</h1>
            {isUsingDemoData && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                <FlaskConical className="w-3.5 h-3.5" />
                Demo Patient Data
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-2">Manage people, places, events and songs for personalized activities.</p>
        </div>
        {!isEditingMemory && !isEditingPerson && (
          <button 
            onClick={() => { 
              if (activeTab === 'People') {
                setCurrentPerson({}); setIsEditingPerson(true); 
              } else {
                setCurrentMemory({ type: getTypeForTab(activeTab) || 'EVENT' }); setIsEditingMemory(true); 
              }
            }}
            className="bg-primary-teal text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-teal-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add {activeTab === 'People' ? 'Person' : 'Memory'}
          </button>
        )}
      </div>

      {!isEditingMemory && !isEditingPerson && (
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['People', 'Places', 'Life Events', 'Songs', 'Objects', 'Childhood'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-primary-teal text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {isEditingPerson && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentPerson.id ? 'Edit Person' : 'Add Person'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input 
                  type="text" 
                  value={currentPerson.name || ''}
                  onChange={e => setCurrentPerson({...currentPerson, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-teal outline-none"
                  placeholder="e.g., Anita"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship *</label>
                <input 
                  type="text" 
                  value={currentPerson.relationship || ''}
                  onChange={e => setCurrentPerson({...currentPerson, relationship: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-teal outline-none"
                  placeholder="e.g., Daughter"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  value={currentPerson.description || ''}
                  onChange={e => setCurrentPerson({...currentPerson, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-teal outline-none resize-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors">
                  {currentPerson.image ? (
                    <div className="relative">
                      <img src={currentPerson.image} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                      <button 
                        onClick={() => setCurrentPerson({...currentPerson, image: undefined})}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">Click to browse or drag and drop</p>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleImageUpload(e, true)}
                        className="w-full cursor-pointer absolute inset-0 opacity-0"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t border-gray-100 pt-6">
            <button 
              onClick={() => setIsEditingPerson(false)}
              className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleSavePerson}
              className="px-8 py-3 rounded-xl font-medium text-white bg-primary-teal hover:bg-teal-700 transition"
            >
              Save Person
            </button>
          </div>
        </div>
      )}

      {isEditingMemory && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentMemory.id ? 'Edit Memory' : 'New Memory'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input 
                  type="text" 
                  value={currentMemory.title || ''}
                  onChange={e => setCurrentMemory({...currentMemory, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-teal outline-none"
                  placeholder="e.g., Wedding Day"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select 
                    value={currentMemory.type || ''}
                    onChange={e => setCurrentMemory({...currentMemory, type: e.target.value as MemoryType})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-teal outline-none"
                  >
                    {memoryTypes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select 
                    value={currentMemory.category || ''}
                    onChange={e => setCurrentMemory({...currentMemory, category: e.target.value as MemoryCategory})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-teal outline-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    <input 
                      type="text" 
                      value={currentMemory.year || ''}
                      onChange={e => setCurrentMemory({...currentMemory, year: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-teal outline-none"
                      placeholder="e.g., 1982"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    <input 
                      type="text" 
                      value={currentMemory.location || ''}
                      onChange={e => setCurrentMemory({...currentMemory, location: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-teal outline-none"
                      placeholder="e.g., Delhi"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  value={currentMemory.content || ''}
                  onChange={e => setCurrentMemory({...currentMemory, content: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-teal outline-none resize-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors">
                  {currentMemory.image ? (
                    <div className="relative">
                      <img src={currentMemory.image} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                      <button 
                        onClick={() => setCurrentMemory({...currentMemory, image: undefined})}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 mb-2 text-sm">Click to upload image</p>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleImageUpload(e, false)}
                        className="w-full cursor-pointer absolute inset-0 opacity-0"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Audio Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Optional Audio (e.g. Song)</label>
                <div className="border border-gray-300 rounded-xl p-4 flex items-center gap-4 relative hover:bg-gray-50">
                  <Music className="w-6 h-6 text-gray-400" />
                  <div className="flex-1">
                    {currentMemory.audioUrl ? (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-600">Audio uploaded</span>
                        <button onClick={() => setCurrentMemory({...currentMemory, audioUrl: undefined})} className="text-red-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Upload audio file...</span>
                    )}
                  </div>
                  {!currentMemory.audioUrl && (
                    <input 
                      type="file" 
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="w-full cursor-pointer absolute inset-0 opacity-0"
                    />
                  )}
                </div>
              </div>

              {/* Associated People */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Associated People
                </label>
                <div className="bg-gray-50 rounded-xl p-4 max-h-32 overflow-y-auto space-y-2">
                  {people.length === 0 ? (
                    <p className="text-sm text-gray-500">No people added yet.</p>
                  ) : (
                    people.map(person => (
                      <label key={person.id} className="flex items-center gap-3 p-1">
                        <input 
                          type="checkbox"
                          checked={(currentMemory.personIds || []).includes(person.id)}
                          onChange={() => togglePerson(person.id)}
                          className="text-primary-teal focus:ring-primary-teal rounded"
                        />
                        <span className="text-sm">{person.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t border-gray-100 pt-6">
            <button 
              onClick={() => setIsEditingMemory(false)}
              className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveMemory}
              className="px-8 py-3 rounded-xl font-medium text-white bg-primary-teal hover:bg-teal-700 transition"
            >
              Save Memory
            </button>
          </div>
        </div>
      )}

      {/* List Views */}
      {!isEditingMemory && !isEditingPerson && activeTab === 'People' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {people.map(person => (
            <div key={person.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 text-center relative overflow-hidden group">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full overflow-hidden mb-4 border-4 border-white shadow-sm">
                {person.image ? (
                  <img src={person.image} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-10 h-10 text-gray-400 mt-6 mx-auto" />
                )}
              </div>
              <h3 className="font-bold text-lg text-gray-900">{person.name}</h3>
              <p className="text-primary-teal font-medium text-sm">{person.relationship}</p>
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 p-1 rounded-lg shadow-sm">
                <button onClick={() => { setCurrentPerson(person); setIsEditingPerson(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeletePerson(person.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isEditingMemory && !isEditingPerson && activeTab !== 'People' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeMemories.map(memory => (
            <div key={memory.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 relative group">
              <div className="h-32 bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                {memory.image ? (
                  <img src={memory.image} className="w-full h-full object-cover" />
                ) : memory.audioUrl ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-teal-50">
                    <Music className="w-8 h-8 text-primary-teal" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-1">{memory.title}</h3>
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{memory.content}</p>
              <div className="text-xs text-gray-400 font-medium">
                {memory.year && `${memory.year} • `}{memory.location && `${memory.location}`}
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 p-1 rounded-lg shadow-sm">
                <button onClick={() => { setCurrentMemory(memory); setIsEditingMemory(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteMemory(memory.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {activeMemories.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-500 border border-dashed rounded-2xl">
              No entries found for {activeTab}. Add one to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
