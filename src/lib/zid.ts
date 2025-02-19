export const parseWorldZid = (zid: string) => {
  const worldZid = zid?.split('.')[0];

  if (worldZid?.length) {
    return worldZid;
  }
};
