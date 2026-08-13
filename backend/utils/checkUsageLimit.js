const User = require('../models/User');
const resetIfNewDay = require('./resetIfNewDay');

const FREE_LIMITS = {
  questionsPerDay: 10,
  uploadsPerDay: 10
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