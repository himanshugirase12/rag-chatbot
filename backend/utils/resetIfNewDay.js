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
  
  module.exports = resetIfNewDay;