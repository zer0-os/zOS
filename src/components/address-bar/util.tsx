export const routeWithApp = (route, app) => {
  return `/${[
    route,
    app,
  ]
    .filter(Boolean)
    .join('/')}`;
};
