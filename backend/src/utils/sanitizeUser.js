export const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const plainUser = user.toJSON ? user.toJSON() : user;
  const { password, ...safeUser } = plainUser;
  return safeUser;
};

