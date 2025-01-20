export const useArweaveAction = (arweaveId: string) => {
  const handleOnClick = () => {
    // @note this is temporarily hardcoded, and will not work on devnet
    window.open(`https://arweave.net/${arweaveId}`, '_blank');
  };

  return {
    handleOnClick,
  };
};
