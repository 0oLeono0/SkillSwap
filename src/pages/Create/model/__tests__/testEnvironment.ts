export const setupUrlObjectMocks = ({
  createObjectURL,
  revokeObjectURL
}: {
  createObjectURL: typeof URL.createObjectURL;
  revokeObjectURL: typeof URL.revokeObjectURL;
}) => {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: createObjectURL
  });

  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: revokeObjectURL
  });
};

export const createConsoleErrorSpy = () =>
  jest.spyOn(console, 'error').mockImplementation(() => {});
