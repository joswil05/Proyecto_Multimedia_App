import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { Idea, PinnedEvent, AppUser } from '../types';
// Mock for expo-notifications since it requires native module in dev build
const Notifications: any = {
  setNotificationHandler: () => {},
  requestPermissionsAsync: async () => ({ status: 'granted' }),
  addNotificationResponseReceivedListener: (_cb: any) => ({ remove: () => {} }),
  scheduleNotificationAsync: async (_opts: any) => 'mock-id',
  cancelScheduledNotificationAsync: async (_id: any) => {},
};

import { collection, onSnapshot, query, where, addDoc, updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

interface DataContextProps {
  events: PinnedEvent[];
  ideas: Idea[];
  teamMembers: AppUser[];
  pinnedEventId: string | null;
  addEvent: (event: Omit<PinnedEvent, 'id' | 'completedContent'>) => void;
  updateEvent: (eventId: string, updates: Partial<PinnedEvent>) => void;
  deleteEvent: (eventId: string) => void;
  pinEvent: (eventId: string | null) => void;
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'status'>) => void;
  updateIdea: (ideaId: string, updates: Partial<Idea>) => void;
  deleteIdea: (ideaId: string) => void;
  globalSelectedIdeaId: string | null;
  setGlobalSelectedIdeaId: (ideaId: string | null) => void;
}

export const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<PinnedEvent[]>([]);
  const [pinnedEventId, setPinnedEventId] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [teamMembers, setTeamMembers] = useState<AppUser[]>([]);
  const [globalSelectedIdeaId, setGlobalSelectedIdeaId] = useState<string | null>(null);

  // Firestore Sync
  React.useEffect(() => {
    if (!user) {
      setIdeas([]);
      setEvents([]);
      setTeamMembers([]);
      return;
    }

    const ideasQuery = query(collection(db, 'ideas'), where('teamId', '==', user.teamId));
    const unsubscribeIdeas = onSnapshot(ideasQuery, (snapshot) => {
      const fetchedIdeas = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        } as Idea;
      });
      setIdeas(fetchedIdeas);
    });

    const eventsQuery = query(collection(db, 'events'), where('teamId', '==', user.teamId));
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      const fetchedEvents = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PinnedEvent));
      setEvents(fetchedEvents);
    });

    const usersQuery = query(collection(db, 'users'), where('teamId', '==', user.teamId));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => doc.data() as AppUser);
      setTeamMembers(fetchedUsers);
    });

    return () => {
      unsubscribeIdeas();
      unsubscribeEvents();
      unsubscribeUsers();
    };
  }, [user]);

  // Pedir permisos al cargar
  React.useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permisos de notificación denegados');
      }
    })();

    const subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const ideaId = response.notification.request.content.data?.ideaId;
      if (ideaId && typeof ideaId === 'string') {
        setGlobalSelectedIdeaId(ideaId);
      }
    });

    return () => subscription.remove();
  }, []);

  const addEvent = useCallback(async (newEvent: Omit<PinnedEvent, 'id' | 'completedContent'>) => {
    if (!user) return;
    const event = {
      ...newEvent,
      completedContent: 0,
      teamId: user.teamId,
    };
    await addDoc(collection(db, 'events'), event);
  }, [user]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<PinnedEvent>) => {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, updates);
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);
    if (pinnedEventId === eventId) setPinnedEventId(null);
  }, [pinnedEventId]);

  const pinEvent = useCallback((eventId: string | null) => {
    setPinnedEventId(eventId);
  }, []);

  const addIdea = useCallback(async (newIdea: Omit<Idea, 'id' | 'createdAt' | 'status'>) => {
    if (!user) return;
    const idea: any = {
      ...newIdea,
      createdAt: Date.now(),
      status: 'banco',
      reviewStatus: 'evaluacion',
      teamId: user.teamId,
      scheduledDate: newIdea.scheduledDate ? newIdea.scheduledDate.getTime() : null,
    };
    
    if (idea.useAI) {
      idea.aiHooks = [
        `¿Sabías que ${idea.text.substring(0, 20)}...?`,
        `3 razones por las que ${idea.text.substring(0, 15)} es importante`,
        `La verdad sobre ${idea.text.substring(0, 15)}`,
      ];
      idea.copyText = `Aquí tienes el borrador generado por IA para tu idea: "${idea.text}". ¡No olvides agregar emojis y llamados a la acción!`;
    }
    
    await addDoc(collection(db, 'ideas'), idea);
  }, [user]);

  const updateIdea = useCallback((ideaId: string, updates: Partial<Idea>) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    (async () => {
      let updatedPublishId = idea.publishNotificationId;
      let updatedReminderId = idea.reminderNotificationId;

      if (updates.scheduledDate !== undefined || updates.notifyPrior !== undefined) {
        if (idea.publishNotificationId) {
          await Notifications.cancelScheduledNotificationAsync(idea.publishNotificationId);
          updatedPublishId = undefined;
        }
        if (idea.reminderNotificationId) {
          await Notifications.cancelScheduledNotificationAsync(idea.reminderNotificationId);
          updatedReminderId = undefined;
        }

        const notifyPrior = updates.notifyPrior !== undefined ? updates.notifyPrior : idea.notifyPrior;
        const scheduledDate = updates.scheduledDate !== undefined ? updates.scheduledDate : idea.scheduledDate;

        if (scheduledDate && scheduledDate > new Date()) {
          const publishId = await Notifications.scheduleNotificationAsync({
            content: {
              title: `🚀 Hora de publicar`,
              body: `${updates.text || idea.text} para ${(updates.channels || idea.channels).join(', ')}`,
              data: { ideaId: idea.id },
            },
            trigger: { date: scheduledDate } as any,
          });
          updatedPublishId = publishId;

          if (notifyPrior) {
            const triggerDate = new Date(scheduledDate.getTime() - 60 * 60 * 1000);
            if (triggerDate > new Date()) {
              const reminderId = await Notifications.scheduleNotificationAsync({
                content: {
                  title: '🚀 Hora de prepararse',
                  body: `Falta 1 hora para publicar: "${updates.text || idea.text}"`,
                  data: { ideaId: idea.id },
                },
                trigger: { date: triggerDate } as any,
              });
              updatedReminderId = reminderId;
            }
          }
        }
      }

      const firestoreUpdates: any = { ...updates };
      if (updates.scheduledDate !== undefined) {
        firestoreUpdates.scheduledDate = updates.scheduledDate ? updates.scheduledDate.getTime() : null;
      }
      if (updatedPublishId !== undefined) firestoreUpdates.publishNotificationId = updatedPublishId;
      if (updatedReminderId !== undefined) firestoreUpdates.reminderNotificationId = updatedReminderId;
      
      const ideaRef = doc(db, 'ideas', ideaId);
      await updateDoc(ideaRef, firestoreUpdates);
    })();
  }, [ideas]);

  const deleteIdea = useCallback(async (ideaId: string) => {
    const ideaRef = doc(db, 'ideas', ideaId);
    await deleteDoc(ideaRef);
  }, []);

  return (
    <DataContext.Provider
      value={{
        events,
        ideas,
        teamMembers,
        pinnedEventId,
        addEvent,
        updateEvent,
        deleteEvent,
        pinEvent,
        addIdea,
        updateIdea,
        deleteIdea,
        globalSelectedIdeaId,
        setGlobalSelectedIdeaId,
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
