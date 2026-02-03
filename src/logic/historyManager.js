import { supabase } from '../supabase';

/**
 * Saves a message to the Supabase database.
 * If user is guest, we might skip this or save to local storage (not implemented for guest).
 */
export const saveMessage = async (sessionId, role, text, node = null) => {
    if (!sessionId || sessionId.startsWith('guest')) return; // Skip for guests

    const { error } = await supabase
        .from('messages')
        .insert([{ session_id: sessionId, role, text, node }]);

    if (error) console.error('Error saving message:', error);
};

export const createSession = async (userId) => {
    if (!userId || userId.startsWith('guest')) return `guest-${Date.now()}`;

    const { data, error } = await supabase
        .from('conversations')
        .insert([{ user_id: userId, summary: 'New Consultation' }])
        .select()
        .single();

    if (error) {
        console.error('Error creating session:', error);
        return null;
    }
    return data.id;
};

export const updateSessionSummary = async (sessionId, firstUserMessage) => {
    if (!sessionId || sessionId.startsWith('guest')) return;

    // Create a 5-6 word summary
    const summary = firstUserMessage.split(' ').slice(0, 6).join(' ') + '...';

    await supabase
        .from('conversations')
        .update({ summary })
        .eq('id', sessionId);
};

export const loadHistory = async (userId) => {
    if (!userId || userId.startsWith('guest')) return [];

    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading history:', error);
        return [];
    }
    return data;
};

export const loadMessages = async (sessionId) => {
    if (!sessionId || sessionId.startsWith('guest')) return [];

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading messages:', error);
        return [];
    }
    return data;
};
