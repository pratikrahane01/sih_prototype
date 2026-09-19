/**
 * DemoMemoryData.ts
 * ==================
 * Centralized demo dataset for the SIH26003 "Calm Intelligence" prototype.
 *
 * This simulates a caregiver who has already entered meaningful memories for the
 * patient "Nani" (age 72, Assamese-speaking).
 *
 * HOW TO REPLACE WITH REAL DATA:
 * - Caregivers enter data via /caregiver/memories in the dashboard.
 * - MemoryService.initializeDemoData() calls this module ONLY when localStorage is empty.
 * - Once a caregiver has entered real data, this module is never used again.
 */

import type { MemoryType, MemoryCategory } from '../../types';

// ── Demo Patient ───────────────────────────────────────────────────────────────
export const DEMO_PATIENT_ID = 'demo_patient_1';

// ── Important People ───────────────────────────────────────────────────────────
export interface DemoPerson {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  description: string;
  image?: string;         // Path relative to /public or a data-URI
  createdAt: string;
}

export const DEMO_PEOPLE: DemoPerson[] = [
  {
    id: 'demo_person_arun',
    patientId: DEMO_PATIENT_ID,
    name: 'Arun',
    relationship: 'Son',
    description: "Nani's eldest son. Lives nearby and visits often.",
    image: '/demo-memories/arun.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo_person_meena',
    patientId: DEMO_PATIENT_ID,
    name: 'Meena',
    relationship: 'Daughter',
    description: "Nani's daughter. Calls every evening.",
    image: '/demo-memories/meena.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo_person_riya',
    patientId: DEMO_PATIENT_ID,
    name: 'Riya',
    relationship: 'Granddaughter',
    description: "Nani's youngest granddaughter. Full of energy!",
    image: '/demo-memories/riya.jpg',
    createdAt: new Date().toISOString()
  }
];

// ── Important Memories ─────────────────────────────────────────────────────────
export interface DemoMemory {
  id: string;
  patientId: string;
  type: MemoryType;
  category: MemoryCategory;
  title: string;
  content: string;
  year?: string;
  location?: string;
  image?: string;
  audioUrl?: string;
  personIds?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export const DEMO_MEMORIES: DemoMemory[] = [
  // ── Life Events ──────────────────────────────────────────────────────────────
  {
    id: 'demo_mem_childhood',
    patientId: DEMO_PATIENT_ID,
    type: 'CHILDHOOD',
    category: 'Childhood',
    title: 'Childhood Days',
    content: 'Growing up in the old house with the mango tree in Jorhat. Playing by the river with cousins.',
    year: '1965',
    location: 'Jorhat',
    image: '/demo-memories/childhood-home.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_wedding',
    patientId: DEMO_PATIENT_ID,
    type: 'EVENT',
    category: 'Marriage',
    title: 'Family Wedding',
    content: 'A beautiful celebration with family and friends. The whole neighbourhood gathered.',
    year: '1982',
    location: 'Guwahati',
    image: '/demo-memories/family-wedding.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_celebration',
    patientId: DEMO_PATIENT_ID,
    type: 'FAMILY',
    category: 'Family',
    title: 'Family Celebration',
    content: 'A wonderful gathering where everyone came together for a big family celebration.',
    year: '1995',
    location: 'Assam',
    image: '/demo-memories/family-celebration.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_trip',
    patientId: DEMO_PATIENT_ID,
    type: 'EVENT',
    category: 'Travel',
    title: 'Family Trip',
    content: 'A memorable journey with the family. The mountains were breathtaking.',
    year: '2005',
    location: 'Kashmir',
    image: '/demo-memories/family-trip.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // ── Places ───────────────────────────────────────────────────────────────────
  {
    id: 'demo_mem_childhood_home',
    patientId: DEMO_PATIENT_ID,
    type: 'PLACE',
    category: 'Places',
    title: 'Childhood Home',
    content: 'The old house with the big garden in Jorhat where Nani grew up.',
    location: 'Jorhat, Assam',
    image: '/demo-memories/childhood-home.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_family_home',
    patientId: DEMO_PATIENT_ID,
    type: 'PLACE',
    category: 'Places',
    title: 'Family Home',
    content: 'The family home where Nani raised her children in Guwahati.',
    location: 'Guwahati, Assam',
    image: '/demo-memories/family-celebration.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // ── Songs (Top 5 Regional Classics) ──────────────────────────────────────────
  {
    id: 'demo_mem_song_1',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Shukratara Mand Wara',
    content: JSON.stringify({ singer: 'Arun Date', movie: 'Bhavgeet', hint: 'The singer is Arun Date and it is a classic Bhavgeet.', language: 'mr' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_1.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_2',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Airaneechya Deva Tula',
    content: JSON.stringify({ singer: 'Lata Mangeshkar', movie: 'Sadhi Manasa', hint: 'This song is sung by Lata Mangeshkar from the movie Sadhi Manasa.', language: 'mr' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_2.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_3',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Mendichya Panavar',
    content: JSON.stringify({ singer: 'Lata Mangeshkar', movie: 'Bhavgeet', hint: 'It is a classic Marathi Bhavgeet sung by Lata Mangeshkar.', language: 'mr' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_3.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_4',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Mi Dolkar Daryacha Raja',
    content: JSON.stringify({ singer: 'Hemant Kumar', movie: 'Koli Geet', hint: 'It is a famous Koli song sung by Hemant Kumar and Lata Mangeshkar.', language: 'mr' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_4.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_5',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Lag Ja Gale',
    content: JSON.stringify({ singer: 'Lata Mangeshkar', movie: 'Woh Kaun Thi', hint: 'It is a classic Hindi song from the movie Woh Kaun Thi, sung by Lata Mangeshkar.', language: 'hi' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_5.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_6',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Bistirno Parore',
    content: JSON.stringify({ singer: 'Bhupen Hazarika', movie: 'Bistirno Parore', hint: 'It is a famous Assamese song sung by Dr. Bhupen Hazarika.', language: 'as' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_6.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_7',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Ya Janmavar Ya Jagnyavar Shatada Prem Karave',
    content: JSON.stringify({ singer: 'Arun Date', movie: 'Bhavgeet', hint: 'It is a soulful Marathi Bhavgeet by Arun Date.', language: 'mr' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_7.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_8',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Kabhi Kabhie Mere Dil Mein',
    content: JSON.stringify({ singer: 'Mukesh', movie: 'Kabhi Kabhie', hint: 'This is a golden era Hindi song by Mukesh from the movie Kabhi Kabhie.', language: 'hi' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_8.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_9',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Awara Hoon',
    content: JSON.stringify({ singer: 'Mukesh', movie: 'Awaara', hint: 'A classic Bollywood track by Mukesh from the movie Awaara.', language: 'hi' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_9.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_10',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Pyar Hua Iqrar Hua',
    content: JSON.stringify({ singer: 'Manna Dey and Lata Mangeshkar', movie: 'Shree 420', hint: 'A legendary romantic duet from the movie Shree 420.', language: 'hi' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_10.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_11',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Suhana Safar Aur Yeh Mausam',
    content: JSON.stringify({ singer: 'Mukesh', movie: 'Madhumati', hint: 'An evergreen track by Mukesh from the movie Madhumati.', language: 'hi' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_11.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_12',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Manuhe Manuhor Babe',
    content: JSON.stringify({ singer: 'Bhupen Hazarika', movie: 'Assamese Classic', hint: 'A powerful humanist anthem in Assamese by Dr. Bhupen Hazarika.', language: 'as' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_12.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_13',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Moi Eti Jajabor',
    content: JSON.stringify({ singer: 'Bhupen Hazarika', movie: 'Assamese Classic', hint: 'A famous vagabond song in Assamese by Bhupen Hazarika.', language: 'as' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_13.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_14',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'Buku Hom Hom Kore',
    content: JSON.stringify({ singer: 'Bhupen Hazarika', movie: 'Assamese Classic', hint: 'A deep emotional Assamese song by Bhupen Hazarika.', language: 'as' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_14.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_mem_song_15',
    patientId: DEMO_PATIENT_ID,
    type: 'SONG',
    category: 'Important Moments',
    title: 'O Bideshi Bandhu',
    content: JSON.stringify({ singer: 'Khagen Mahanta', movie: 'Assamese Folk', hint: 'A classic Assamese folk song by Khagen Mahanta.', language: 'as' }),
    image: '/demo-memories/favorite-song.jpg',
    audioUrl: '/audio/song_15.m4a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ── Distractor pools (for question generation) ─────────────────────────────────
export const DISTRACTOR_NAMES   = ['Suresh', 'Priya', 'Kavita', 'Rajesh', 'Anand', 'Sita', 'Mohan'];
export const DISTRACTOR_RELS    = ['Friend', 'Neighbour', 'Doctor', 'Teacher', 'Cousin', 'Uncle', 'Aunt'];
export const DISTRACTOR_PLACES  = ['Delhi', 'Mumbai', 'Kolkata', 'Shillong', 'Dibrugarh', 'Tezpur', 'Bhubaneswar'];
export const DISTRACTOR_SONGS   = ['Bihu Dance Song', 'Morning Prayer', 'Folk Melody', 'Festival Music', 'Raag Bhairavi'];
