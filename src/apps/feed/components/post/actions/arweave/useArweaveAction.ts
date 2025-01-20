export const useArweaveAction = (arweaveId: string) => {
  const handleOnClick = () => {
    // @note this is temporarily hardcoded, and will not work on devnet
    window.open(`https://irys.xyz/${arweaveId}`, '_blank');
  };

  return {
    handleOnClick,
  };
};
