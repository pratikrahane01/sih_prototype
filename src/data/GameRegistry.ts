import type { GameDefinition } from '../types';
import memoryPoster from '../assets/games/memory-match.png';
import attentionPoster from '../assets/games/selective-attention.jpg';
import patternPoster from '../assets/games/pattern-completion.png';
import spatialPoster from '../assets/games/spatial-navigation.png';

export const GameRegistry: GameDefinition[] = [
  {
    id: 'memory-game',
    name: 'Memory Match',
    domain: 'memory',
    description: 'Remember the objects shown and identify them later.',
    baseDifficulty: 1,
    icon: 'Brain',
    poster: memoryPoster,
    estimatedDuration: '3 min',
    instructions: 'You will see a few objects. Try to remember them. When they disappear, select the ones you saw.'
  },
  {
    id: 'attention-game',
    name: 'Selective Attention',
    domain: 'attention',
    description: 'Find the target symbol among distractors quickly.',
    baseDifficulty: 1,
    icon: 'Star',
    poster: attentionPoster,
    estimatedDuration: '2 min',
    instructions: 'Tap the BLUE STAR as quickly as you can, ignoring other shapes.'
  },
  {
    id: 'pattern-game',
    name: 'Pattern Completion',
    domain: 'pattern',
    description: 'Identify what comes next in the visual sequence.',
    baseDifficulty: 1,
    icon: 'Activity',
    poster: patternPoster,
    estimatedDuration: '4 min',
    instructions: 'Look at the sequence of shapes. Choose the shape that correctly completes the pattern.'
  },
  {
    id: 'spatial-game',
    name: 'Spatial Navigation',
    domain: 'spatial',
    description: 'Find the correct direction to reach the target.',
    baseDifficulty: 1,
    icon: 'Map',
    poster: spatialPoster,
    estimatedDuration: '3 min',
    instructions: 'Look at the map and identify which direction you need to go to reach the red pin.'
  },
  {
    id: 'who-is-this',
    name: 'Who Is This?',
    domain: 'personal_person',
    description: 'Recognize familiar people from your life.',
    baseDifficulty: 1,
    icon: 'Users',
    estimatedDuration: '3 min',
    instructions: 'Look at the photo and select the name or relationship of the person shown.'
  },
  {
    id: 'memory-moments',
    name: 'Memory Moments',
    domain: 'personal_memory',
    description: 'Recall details from important moments in your life.',
    baseDifficulty: 1,
    icon: 'Image',
    estimatedDuration: '4 min',
    instructions: 'Look at the memory, then answer questions about where or when it happened.'
  },
  {
    id: 'life-story',
    name: 'My Life Story',
    domain: 'personal_timeline',
    description: 'Arrange your life events in the correct order.',
    baseDifficulty: 2,
    icon: 'Calendar',
    estimatedDuration: '5 min',
    instructions: 'Look at the events and select the one that happened first.'
  },
  {
    id: 'favorite-song',
    name: 'My Favorite Song',
    domain: 'personal_song',
    description: 'Recognize music that is important to you.',
    baseDifficulty: 1,
    icon: 'Music',
    estimatedDuration: '2 min',
    instructions: 'Listen to the audio clip and tell us what song it is.'
  }
];
