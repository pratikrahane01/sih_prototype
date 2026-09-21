import type { GameDefinition } from '../types';
import memoryPoster from '../assets/games/memory_match_poster.jpg';
import attentionPoster from '../assets/games/selective_attention_poster.jpg';
import patternPoster from '../assets/games/pattern_completion_poster.jpg';
import spatialPoster from '../assets/games/spatial_navigation_poster.jpg';
import whoIsThisPoster from '../assets/games/who_is_this_poster.jpg';
import memoryMomentsPoster from '../assets/games/memory_moments_poster.jpg';

import favoriteSongPoster from '../assets/games/favorite_song_poster.jpg';

export const GameRegistry: GameDefinition[] = [
  {
    id: 'memory-game',
    name: 'Memory Match',
    titleKey: 'game.memoryMatch.title',
    descriptionKey: 'game.memoryMatch.description',
    instructionsKey: 'game.memoryMatch.instructions',
    category: 'general',
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
    titleKey: 'game.selectiveAttention.title',
    descriptionKey: 'game.selectiveAttention.description',
    instructionsKey: 'game.selectiveAttention.instructions',
    category: 'general',
    domain: 'attention',
    description: 'Find the target symbol among distractors quickly.',
    baseDifficulty: 1,
    icon: 'Star',
    poster: attentionPoster,
    estimatedDuration: '2 min',
    instructions: 'Tap the DIYA (Oil Lamp) as quickly as you can, ignoring other shapes.'
  },
  {
    id: 'pattern-game',
    name: 'Pattern Completion',
    titleKey: 'game.patternCompletion.title',
    descriptionKey: 'game.patternCompletion.description',
    instructionsKey: 'game.patternCompletion.instructions',
    category: 'general',
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
    titleKey: 'game.spatialNavigation.title',
    descriptionKey: 'game.spatialNavigation.description',
    instructionsKey: 'game.spatialNavigation.instructions',
    category: 'general',
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
    titleKey: 'game.whoIsThis.title',
    descriptionKey: 'game.whoIsThis.description',
    instructionsKey: 'game.whoIsThis.instructions',
    category: 'personalized',
    domain: 'personal_person',
    description: 'Recognize familiar people from your life.',
    baseDifficulty: 1,
    icon: 'Users',
    poster: whoIsThisPoster,
    estimatedDuration: '3 min',
    instructions: 'Look at the photo and select the name or relationship of the person shown.'
  },

  {
    id: 'favorite-song',
    name: 'My Favorite Song',
    titleKey: 'game.favoriteSong.title',
    descriptionKey: 'game.favoriteSong.description',
    instructionsKey: 'game.favoriteSong.instructions',
    category: 'personalized',
    domain: 'personal_song',
    description: 'Recognize music that is important to you.',
    baseDifficulty: 1,
    icon: 'Music',
    poster: favoriteSongPoster,
    estimatedDuration: '2 min',
    instructions: 'Listen to the audio clip and tell us what song it is.'
  },
  {
    id: 'historical-journey',
    name: 'Historical Journey',
    titleKey: 'game.historicalJourney.title',
    descriptionKey: 'game.historicalJourney.description',
    instructionsKey: 'game.historicalJourney.instructions',
    category: 'personalized',
    domain: 'personal_history',
    description: 'Watch animated historical stories and answer questions.',
    baseDifficulty: 2,
    icon: 'Play',
    poster: memoryMomentsPoster, // reusing an existing poster for now
    estimatedDuration: '3 min',
    instructions: 'Watch the animated video, then tell us what happened.'
  }
];
