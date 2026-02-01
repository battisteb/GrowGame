/**
 * Statistics Service
 *
 * Aggregated data queries for the statistics/history screen:
 * - Completion history (last N days)
 * - Daily completion counts (for heatmap)
 * - Domain distribution
 * - Summary stats
 */

import { supabase } from './supabase';
import type { HabitLog } from '../types';

export interface DailyCompletionCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface DomainStat {
  domain: string;
  completions: number;
  totalXp: number;
}

export interface StatsSummary {
  totalCompletions: number;
  totalXpEarned: number;
  totalCoinsEarned: number;
  rankedCompletions: number;
  averagePerDay: number;
}

/**
 * Get completion counts per day for the last N days
 */
export const getDailyCompletions = async (
  characterId: string,
  days: number = 30
): Promise<{ success: boolean; data?: DailyCompletionCount[]; error?: string }> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('habit_logs')
      .select('completed_at, habits!inner(character_id)')
      .eq('habits.character_id', characterId)
      .gte('completed_at', startDateStr)
      .order('completed_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching daily completions:', error);
      return { success: false, error: error.message };
    }

    // Group by date
    const countMap = new Map<string, number>();
    (data || []).forEach((log: any) => {
      const date = log.completed_at.split('T')[0];
      countMap.set(date, (countMap.get(date) || 0) + 1);
    });

    const result: DailyCompletionCount[] = [];
    for (let i = 0; i <= days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - i));
      const dateStr = d.toISOString().split('T')[0];
      result.push({ date: dateStr, count: countMap.get(dateStr) || 0 });
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Exception in getDailyCompletions:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get domain breakdown stats
 */
export const getDomainStats = async (
  characterId: string
): Promise<{ success: boolean; data?: DomainStat[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('xp_earned, habits!inner(character_id, domain)')
      .eq('habits.character_id', characterId);

    if (error) {
      console.error('❌ Error fetching domain stats:', error);
      return { success: false, error: error.message };
    }

    const domainMap = new Map<string, { completions: number; totalXp: number }>();
    (data || []).forEach((log: any) => {
      const domain = log.habits.domain;
      const existing = domainMap.get(domain) || { completions: 0, totalXp: 0 };
      existing.completions += 1;
      existing.totalXp += log.xp_earned;
      domainMap.set(domain, existing);
    });

    const result: DomainStat[] = Array.from(domainMap.entries()).map(
      ([domain, stats]) => ({
        domain,
        completions: stats.completions,
        totalXp: stats.totalXp,
      })
    );

    // Sort by completions descending
    result.sort((a, b) => b.completions - a.completions);

    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Exception in getDomainStats:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get overall summary statistics
 */
export const getStatsSummary = async (
  characterId: string
): Promise<{ success: boolean; data?: StatsSummary; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('xp_earned, coins_earned, completion_mode, completed_at, habits!inner(character_id)')
      .eq('habits.character_id', characterId);

    if (error) {
      console.error('❌ Error fetching stats summary:', error);
      return { success: false, error: error.message };
    }

    const logs = data || [];
    const totalCompletions = logs.length;
    const totalXpEarned = logs.reduce((sum: number, l: any) => sum + l.xp_earned, 0);
    const totalCoinsEarned = logs.reduce((sum: number, l: any) => sum + l.coins_earned, 0);
    const rankedCompletions = logs.filter((l: any) => l.completion_mode === 'ranked').length;

    // Calculate average per day based on date range
    let averagePerDay = 0;
    if (totalCompletions > 0) {
      const dates = new Set(logs.map((l: any) => l.completed_at.split('T')[0]));
      const firstDate = new Date(
        logs.reduce((min: string, l: any) =>
          l.completed_at < min ? l.completed_at : min, logs[0].completed_at
        )
      );
      const daysSinceFirst = Math.max(
        1,
        Math.ceil((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      averagePerDay = Math.round((totalCompletions / daysSinceFirst) * 10) / 10;
    }

    return {
      success: true,
      data: {
        totalCompletions,
        totalXpEarned,
        totalCoinsEarned,
        rankedCompletions,
        averagePerDay,
      },
    };
  } catch (error) {
    console.error('❌ Exception in getStatsSummary:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get recent habit completions with habit names
 */
export const getRecentCompletions = async (
  characterId: string,
  limit: number = 20
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('id, completed_at, xp_earned, coins_earned, completion_mode, habits!inner(character_id, name, domain)')
      .eq('habits.character_id', characterId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching recent completions:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Exception in getRecentCompletions:', error);
    return { success: false, error: String(error) };
  }
};
