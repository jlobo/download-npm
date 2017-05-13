export default typeof window !== 'undefined' ? window
  : { TEMPORARY: 0, PERSISTENT: 1, requestFileSystem: () => {} }
