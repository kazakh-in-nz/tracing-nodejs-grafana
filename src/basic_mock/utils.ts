export const getStringAfterTimeout = async (
  msg: string,
  timeoutSeconds: number
): Promise<string> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`${msg} after ${timeoutSeconds}s`);
    }, timeoutSeconds * 1000);
  });
};
