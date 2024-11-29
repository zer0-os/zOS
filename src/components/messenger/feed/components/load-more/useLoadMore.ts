export const useLoadMore = () => {
  const count = 10;

  return {
    hasMore: count > 0,
    count,
  };
};
