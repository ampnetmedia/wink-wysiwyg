import { ReactNode } from "react";

/**
 * Base interface for mention data
 */
export interface MentionData {
  /** Unique identifier for the mention */
  id: string;
  /** Display name for the mention */
  name: string;
  /** Username or handle */
  username?: string;
  /** Avatar URL */
  avatar?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Mention suggestion item
 */
export interface MentionSuggestion {
  /** Mention data */
  data: MentionData;
  /** Custom render function */
  render?: (data: MentionData) => ReactNode;
  /** Whether the suggestion is selected */
  selected?: boolean;
  /** Whether the suggestion is disabled */
  disabled?: boolean;
}

/**
 * Mention configuration
 */
export interface MentionConfig {
  /** Character that triggers mention suggestions */
  trigger: string;
  /** Minimum characters before showing suggestions */
  minCharacters?: number;
  /** Maximum number of suggestions to show */
  maxSuggestions?: number;
  /** Whether to allow spaces in mentions */
  allowSpaces?: boolean;
  /** Custom mention renderer */
  renderMention?: (data: MentionData) => ReactNode;
  /** Custom suggestion renderer */
  renderSuggestion?: (suggestion: MentionSuggestion) => ReactNode;
  /** Function to fetch mention suggestions */
  fetchSuggestions?: (query: string) => Promise<MentionData[]>;
  /** Debounce delay for fetching suggestions */
  debounceDelay?: number;
  /** Whether to show suggestions on empty query */
  showOnEmpty?: boolean;
  /** Custom CSS class for mentions */
  mentionClass?: string;
  /** Custom CSS class for suggestions */
  suggestionClass?: string;
}

/**
 * Mention state
 */
export interface MentionState {
  /** Whether mention suggestions are visible */
  isVisible: boolean;
  /** Current query string */
  query: string;
  /** Current suggestions */
  suggestions: MentionSuggestion[];
  /** Selected suggestion index */
  selectedIndex: number;
  /** Mention range in the editor */
  range?: {
    from: number;
    to: number;
  };
}

/**
 * Mention event handlers
 */
export interface MentionEvents {
  /** Called when mention suggestions are shown */
  onShow?: (query: string) => void;
  /** Called when mention suggestions are hidden */
  onHide?: () => void;
  /** Called when a mention is selected */
  onSelect?: (mention: MentionData) => void;
  /** Called when mention query changes */
  onQueryChange?: (query: string) => void;
  /** Called when mention suggestions are fetched */
  onFetch?: (query: string, suggestions: MentionData[]) => void;
}

/**
 * Hashtag data
 */
export interface HashtagData {
  /** Hashtag text (without #) */
  tag: string;
  /** Number of posts using this hashtag */
  count?: number;
  /** Whether the hashtag is trending */
  trending?: boolean;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Hashtag suggestion item
 */
export interface HashtagSuggestion {
  /** Hashtag data */
  data: HashtagData;
  /** Custom render function */
  render?: (data: HashtagData) => ReactNode;
  /** Whether the suggestion is selected */
  selected?: boolean;
  /** Whether the suggestion is disabled */
  disabled?: boolean;
}

/**
 * Hashtag configuration
 */
export interface HashtagConfig {
  /** Character that triggers hashtag suggestions */
  trigger: string;
  /** Minimum characters before showing suggestions */
  minCharacters?: number;
  /** Maximum number of suggestions to show */
  maxSuggestions?: number;
  /** Whether to allow spaces in hashtags */
  allowSpaces?: boolean;
  /** Custom hashtag renderer */
  renderHashtag?: (data: HashtagData) => ReactNode;
  /** Custom suggestion renderer */
  renderSuggestion?: (suggestion: HashtagSuggestion) => ReactNode;
  /** Function to fetch hashtag suggestions */
  fetchSuggestions?: (query: string) => Promise<HashtagData[]>;
  /** Debounce delay for fetching suggestions */
  debounceDelay?: number;
  /** Whether to show suggestions on empty query */
  showOnEmpty?: boolean;
  /** Custom CSS class for hashtags */
  hashtagClass?: string;
  /** Custom CSS class for suggestions */
  suggestionClass?: string;
  /** Function to handle hashtag clicks */
  onHashtagClick?: (hashtag: string) => void;
}

/**
 * Hashtag state
 */
export interface HashtagState {
  /** Whether hashtag suggestions are visible */
  isVisible: boolean;
  /** Current query string */
  query: string;
  /** Current suggestions */
  suggestions: HashtagSuggestion[];
  /** Selected suggestion index */
  selectedIndex: number;
  /** Hashtag range in the editor */
  range?: {
    from: number;
    to: number;
  };
}

/**
 * Hashtag event handlers
 */
export interface HashtagEvents {
  /** Called when hashtag suggestions are shown */
  onShow?: (query: string) => void;
  /** Called when hashtag suggestions are hidden */
  onHide?: () => void;
  /** Called when a hashtag is selected */
  onSelect?: (hashtag: HashtagData) => void;
  /** Called when hashtag query changes */
  onQueryChange?: (query: string) => void;
  /** Called when hashtag suggestions are fetched */
  onFetch?: (query: string, suggestions: HashtagData[]) => void;
  /** Called when a hashtag is clicked */
  onClick?: (hashtag: string) => void;
}

/**
 * Combined mention and hashtag configuration
 */
export interface SocialFeaturesConfig {
  /** Mention configuration */
  mentions?: MentionConfig;
  /** Hashtag configuration */
  hashtags?: HashtagConfig;
  /** Whether to enable mentions */
  enableMentions?: boolean;
  /** Whether to enable hashtags */
  enableHashtags?: boolean;
}

/**
 * Social features state
 */
export interface SocialFeaturesState {
  /** Mention state */
  mentions: MentionState;
  /** Hashtag state */
  hashtags: HashtagState;
}

/**
 * Social features event handlers
 */
export interface SocialFeaturesEvents {
  /** Mention event handlers */
  mentions?: MentionEvents;
  /** Hashtag event handlers */
  hashtags?: HashtagEvents;
}
