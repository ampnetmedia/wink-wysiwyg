import { useState, useCallback, useRef, useEffect } from "react";
import { Editor } from "@tiptap/react";
import {
  HashtagData,
  HashtagSuggestion,
  HashtagConfig,
  HashtagState,
} from "../types/mentions";

/**
 * Custom hook for hashtag functionality
 *
 * Handles #hashtag detection, suggestions, and interactions.
 */
export const useHashtags = (editor: Editor | null, config: HashtagConfig) => {
  const [hashtagState, setHashtagState] = useState<HashtagState>({
    isVisible: false,
    query: "",
    suggestions: [],
    selectedIndex: 0,
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch hashtag suggestions
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!config.fetchSuggestions) return;

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        const suggestions = await config.fetchSuggestions(query);

        // Check if request was aborted
        if (abortControllerRef.current.signal.aborted) return;

        const hashtagSuggestions: HashtagSuggestion[] = suggestions.map(
          (data, index) => ({
            data,
            selected: index === 0,
          })
        );

        setHashtagState((prev) => ({
          ...prev,
          suggestions: hashtagSuggestions,
          selectedIndex: 0,
        }));
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error fetching hashtag suggestions:", error);
        }
      }
    },
    [config.fetchSuggestions]
  );

  // Debounced fetch suggestions
  const debouncedFetchSuggestions = useCallback(
    (query: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, config.debounceDelay || 300);
    },
    [fetchSuggestions, config.debounceDelay]
  );

  // Show hashtag suggestions
  const showSuggestions = useCallback(
    (query: string) => {
      setHashtagState((prev) => ({
        ...prev,
        isVisible: true,
        query,
      }));

      if (query.length >= (config.minCharacters || 0)) {
        debouncedFetchSuggestions(query);
      } else if (config.showOnEmpty) {
        debouncedFetchSuggestions("");
      }
    },
    [config.minCharacters, config.showOnEmpty, debouncedFetchSuggestions]
  );

  // Hide hashtag suggestions
  const hideSuggestions = useCallback(() => {
    setHashtagState((prev) => ({
      ...prev,
      isVisible: false,
      query: "",
      suggestions: [],
      selectedIndex: 0,
    }));

    // Cancel any pending requests
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Select next suggestion
  const selectNext = useCallback(() => {
    setHashtagState((prev) => {
      const maxIndex = Math.min(
        prev.suggestions.length - 1,
        (config.maxSuggestions || 10) - 1
      );
      const nextIndex =
        prev.selectedIndex < maxIndex ? prev.selectedIndex + 1 : 0;

      return {
        ...prev,
        selectedIndex: nextIndex,
        suggestions: prev.suggestions.map((suggestion, index) => ({
          ...suggestion,
          selected: index === nextIndex,
        })),
      };
    });
  }, [config.maxSuggestions]);

  // Select previous suggestion
  const selectPrevious = useCallback(() => {
    setHashtagState((prev) => {
      const maxIndex = Math.min(
        prev.suggestions.length - 1,
        (config.maxSuggestions || 10) - 1
      );
      const prevIndex =
        prev.selectedIndex > 0 ? prev.selectedIndex - 1 : maxIndex;

      return {
        ...prev,
        selectedIndex: prevIndex,
        suggestions: prev.suggestions.map((suggestion, index) => ({
          ...suggestion,
          selected: index === prevIndex,
        })),
      };
    });
  }, [config.maxSuggestions]);

  // Select suggestion by index
  const selectSuggestion = useCallback((index: number) => {
    setHashtagState((prev) => ({
      ...prev,
      selectedIndex: index,
      suggestions: prev.suggestions.map((suggestion, i) => ({
        ...suggestion,
        selected: i === index,
      })),
    }));
  }, []);

  // Insert selected hashtag
  const insertHashtag = useCallback(
    (hashtag?: HashtagData) => {
      if (!editor) return;

      const selectedHashtag =
        hashtag || hashtagState.suggestions[hashtagState.selectedIndex]?.data;
      if (!selectedHashtag) return;

      // Insert hashtag text
      const hashtagText = `#${selectedHashtag.tag}`;
      editor.commands.insertContent(hashtagText);

      // Hide suggestions
      hideSuggestions();
    },
    [
      editor,
      hashtagState.suggestions,
      hashtagState.selectedIndex,
      hideSuggestions,
    ]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!hashtagState.isVisible) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          selectNext();
          break;
        case "ArrowUp":
          event.preventDefault();
          selectPrevious();
          break;
        case "Enter":
        case "Tab":
          event.preventDefault();
          insertHashtag();
          break;
        case "Escape":
          event.preventDefault();
          hideSuggestions();
          break;
      }
    },
    [
      hashtagState.isVisible,
      selectNext,
      selectPrevious,
      insertHashtag,
      hideSuggestions,
    ]
  );

  // Handle hashtag click
  const handleHashtagClick = useCallback(
    (hashtag: string) => {
      if (config.onHashtagClick) {
        config.onHashtagClick(hashtag);
      }
    },
    [config.onHashtagClick]
  );

  // Check if cursor is in hashtag context
  const isInHashtagContext = useCallback(() => {
    if (!editor) return false;

    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;

    const textBefore = $from.nodeBefore?.textContent || "";
    const triggerIndex = textBefore.lastIndexOf(config.trigger);

    if (triggerIndex !== -1) {
      const textAfterTrigger = textBefore.slice(triggerIndex + 1);
      const hasSpace = textAfterTrigger.includes(" ");

      if (!hasSpace) {
        return true;
      }
    }

    return false;
  }, [editor, config.trigger]);

  // Get hashtag query from current position
  const getHashtagQuery = useCallback(() => {
    if (!editor) return "";

    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;

    const textBefore = $from.nodeBefore?.textContent || "";
    const triggerIndex = textBefore.lastIndexOf(config.trigger);

    if (triggerIndex !== -1) {
      return textBefore.slice(triggerIndex + 1);
    }

    return "";
  }, [editor, config.trigger]);

  // Extract hashtags from content
  const extractHashtags = useCallback(
    (content?: string) => {
      const text = content || editor?.getText() || "";
      const hashtagRegex = /#(\w+)/g;
      const hashtags: string[] = [];
      let match;

      while ((match = hashtagRegex.exec(text)) !== null) {
        hashtags.push(match[1]);
      }

      return [...new Set(hashtags)]; // Remove duplicates
    },
    [editor]
  );

  // Highlight hashtags in content
  const highlightHashtags = useCallback((content: string) => {
    const hashtagRegex = /#(\w+)/g;
    return content.replace(hashtagRegex, (match, tag) => {
      return `<span class="wink-hashtag" data-hashtag="${tag}">${match}</span>`;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    hashtagState,
    showSuggestions,
    hideSuggestions,
    selectNext,
    selectPrevious,
    selectSuggestion,
    insertHashtag,
    handleKeyDown,
    handleHashtagClick,
    isInHashtagContext,
    getHashtagQuery,
    extractHashtags,
    highlightHashtags,
  };
};
