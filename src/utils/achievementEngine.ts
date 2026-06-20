import type { UserProfile } from '../types';

/**
 * Scans the user's current points and lifestyle choices to unlock achievements.
 * Awards bonus points when achievements are unlocked.
 */
export const runAchievementScans = (user: UserProfile): UserProfile => {
  const today = new Date().toLocaleDateString();
  let newlyUnlockedCount = 0;

  const scannedAchievements = user.achievements.map(ach => {
    if (ach.unlocked) return ach; // keep unlocked ones

    let triggerUnlock = false;

    // Rule checks:
    if (ach.id === 'ac2' && user.totalPoints >= 100) {
      triggerUnlock = true;
    }
    if (ach.id === 'ac3' && user.currentData) {
      const mode = user.currentData.commuteMode;
      if (mode === 'bicycle_walk' || mode === 'transit' || mode === 'car_electric') {
        triggerUnlock = true;
      }
    }
    if (ach.id === 'ac4' && user.currentData) {
      const diet = user.currentData.dietType;
      if (diet === 'vegetarian' || diet === 'vegan') {
        triggerUnlock = true;
      }
    }
    if (ach.id === 'ac5' && user.currentData) {
      if (user.currentData.electricitySource === 'solar_renewable') {
        triggerUnlock = true;
      }
    }

    if (triggerUnlock) {
      newlyUnlockedCount++;
      return { ...ach, unlocked: true, unlockedAt: today };
    }
    return ach;
  });

  if (newlyUnlockedCount > 0) {
    return {
      ...user,
      achievements: scannedAchievements,
      totalPoints: user.totalPoints + (newlyUnlockedCount * 20) // award bonus points for each achievement unlock!
    };
  }
  return { ...user, achievements: scannedAchievements };
};
