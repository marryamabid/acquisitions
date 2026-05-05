export const cookies = {
  getOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  }),
  set: (res, name, value, options = {}) => {
    res.cookie(name, value, { ...options, ...cookies.getOptions() });
  },
  clear: (res, name, options = {}) => {
    res.clearCookie(name, { ...options, ...cookies.getOptions() });
  },
  get: (req, name) => {
    return req.cookies[name];
  },
};
