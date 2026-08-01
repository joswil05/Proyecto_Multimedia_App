import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Idea, PinnedEvent } from '../types';

interface DataContextProps {
  events: PinnedEvent[];
  ideas: Idea[];
  pinnedEventId: string | null;
  addEvent: (event: Omit<PinnedEvent, 'id' | 'completedContent'>) => void;
  updateEvent: (eventId: string, updates: Partial<PinnedEvent>) => void;
  deleteEvent: (eventId: string) => void;
  pinEvent: (eventId: string | null) => void;
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'status'>) => void;
  updateIdea: (ideaId: string, updates: Partial<Idea>) => void;
  deleteIdea: (ideaId: string) => void;
}

export const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<PinnedEvent[]>([]);
  const [pinnedEventId, setPinnedEventId] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  const addEvent = useCallback((newEvent: Omit<PinnedEvent, 'id' | 'completedContent'>) => {
    const event: PinnedEvent = {
      ...newEvent,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      completedContent: 0,
    };
    setEvents((prev) => [...prev, event]);
    setPinnedEventId(event.id);
  }, []);

  const updateEvent = useCallback((eventId: string, updates: Partial<PinnedEvent>) => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === eventId ? { ...evt, ...updates } : evt))
    );
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setPinnedEventId((prev) => (prev === eventId ? null : prev));
    setIdeas((prev) =>
      prev.map((idea) => (idea.eventId === eventId ? { ...idea, eventId: undefined } : idea))
    );
  }, []);

  const pinEvent = useCallback((eventId: string | null) => {
    setPinnedEventId(eventId);
  }, []);

  const addIdea = useCallback((newIdea: Omit<Idea, 'id' | 'createdAt' | 'status'>) => {
    const idea: Idea = {
      ...newIdea,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: 'idea',
      createdAt: new Date(),
    };
    // Simular hooks y copy si usa IA
    if (idea.useAI) {
      idea.aiHooks = [
        `¿Sabías que ${idea.text.substring(0, 20)}...?`,
        `3 razones por las que ${idea.text.substring(0, 15)} es importante`,
        `La verdad sobre ${idea.text.substring(0, 15)}`,
      ];
      idea.copyText = `Aquí tienes el borrador generado por IA para tu idea: "${idea.text}". ¡No olvides agregar emojis y llamados a la acción!`;
    }
    setIdeas((prev) => [idea, ...prev]);
  }, []);

  const updateIdea = useCallback((ideaId: string, updates: Partial<Idea>) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === ideaId) {
          const updatedIdea = { ...idea, ...updates };
          return updatedIdea;
        }
        return idea;
      })
    );
  }, []);

  const deleteIdea = useCallback((ideaId: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
  }, []);

  return (
    <DataContext.Provider
      value={{
        events,
        ideas,
        pinnedEventId,
        addEvent,
        updateEvent,
        deleteEvent,
        pinEvent,
        addIdea,
        updateIdea,
        deleteIdea,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = React.useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
