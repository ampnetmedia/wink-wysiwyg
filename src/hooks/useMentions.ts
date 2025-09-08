import { useState, useCallback, useRef, useEffect } from "react";
import { Editor } from "@tiptap/react";
import {
  MentionData,
  MentionSuggestion,
  MentionConfig,
  MentionState,
} from "../types/mentions";

/**
 * Custom hook for mention functionality
 *
 * Handles @mention detection, suggestions, and interactions.
 */
export const useMentions = (editor: Editor | null, config: MentionConfig) => {
  const [mentionState, setMentionState] = useState<MentionState>({
    isVisible: false,
    query: "",
    suggestions: [],
    selectedIndex: 0,
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch mention suggestions
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

        const mentionSuggestions: MentionSuggestion[] = suggestions.map(
          (data, index) => ({
            data,
            selected: index === 0,
          })
        );

        setMentionState((prev) => ({
          ...prev,
          suggestions: mentionSuggestions,
          selectedIndex: 0,
        }));
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error fetching mention suggestions:", error);
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

  // Show mention suggestions
  const showSuggestions = useCallback(
    (query: string) => {
      setMentionState((prev) => ({
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

  // Hide mention suggestions
  const hideSuggestions = useCallback(() => {
    setMentionState((prev) => ({
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
    setMentionState((prev) => {
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
    setMentionState((prev) => {
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
    setMentionState((prev) => ({
      ...prev,
      selectedIndex: index,
      suggestions: prev.suggestions.map((suggestion, i) => ({
        ...suggestion,
        selected: i === index,
      })),
    }));
  }, []);

  // Insert selected mention
  const insertMention = useCallback(
    (mention?: MentionData) => {
      if (!editor) return;

      const selectedMention =
        mention || mentionState.suggestions[mentionState.selectedIndex]?.data;
      if (!selectedMention) return;

      // Insert mention node
      editor.commands.insertContent({
        type: "mention",
        attrs: {
          id: selectedMention.id,
          label: selectedMention.name,
          username: selectedMention.username,
          avatar: selectedMention.avatar,
          metadata: selectedMention.metadata,
        },
      });

      // Hide suggestions
      hideSuggestions();
    },
    [
      editor,
      mentionState.suggestions,
      mentionState.selectedIndex,
      hideSuggestions,
    ]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!mentionState.isVisible) return;

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
          insertMention();
          break;
        case "Escape":
          event.preventDefault();
          hideSuggestions();
          break;
      }
    },
    [
      mentionState.isVisible,
      selectNext,
      selectPrevious,
      insertMention,
      hideSuggestions,
    ]
  );

  // Handle mention click
  const handleMentionClick = useCallback(
    (mention: MentionData) => {
      insertMention(mention);
    },
    [insertMention]
  );

  // Check if cursor is in mention context
  const isInMentionContext = useCallback(() => {
    if (!editor) return false;

    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;

    // Check if we're in a mention node
    const mentionNode = $from.node();
    if (mentionNode.type.name === "mention") {
      return true;
    }

    // Check if we're after a mention trigger
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

  // Get mention query from current position
  const getMentionQuery = useCallback(() => {
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
    mentionState,
    showSuggestions,
    hideSuggestions,
    selectNext,
    selectPrevious,
    selectSuggestion,
    insertMention,
    handleKeyDown,
    handleMentionClick,
    isInMentionContext,
    getMentionQuery,
  };
};
