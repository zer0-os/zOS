export const useArweaveAction = (arweaveId: string) => {
  const handleOnClick = () => {
    window.open(`https://irys.xyz/${arweaveId}`, '_blank');
  };

  return {
    handleOnClick,
  };
};
