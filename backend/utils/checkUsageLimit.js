const User = require('../models/User');

const FREE_LIMITS = {
  questionsPerDay: 10,
  uploadsPerDay: 10
};

const resetIfNewDay = (user) => {
  const now = new Date();
  const lastReset = new Date(user.usageResetAt);

  const isNewDay =
    now.getFullYear() !== lastReset.getFullYear() ||
    now.getMonth() !== lastReset.getMonth() ||
    now.getDate() !== lastReset.getDate();

  if (isNewDay) {
    user.questionsToday = 0;
    user.uploadsToday = 0;
    user.usageResetAt = now;
  }
};

const checkAndIncrement = async (userId, type) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  resetIfNewDay(user);

  if (user.plan === 'pro') {
    await user.save();
    return { allowed: true };
  }

  const field = type === 'question' ? 'questionsToday' : 'uploadsToday';
  const limit = type === 'question' ? FREE_LIMITS.questionsPerDay : FREE_LIMITS.uploadsPerDay;

  if (user[field] >= limit) {
    await user.save();
    return {
      allowed: false,
      message: `You've reached your daily free limit of ${limit} ${type}s. Upgrade to Pro for unlimited access.`
    };
  }

  user[field] += 1;
  await user.save();
  return { allowed: true, remaining: limit - user[field] };
};

module.exports = checkAndIncrement;