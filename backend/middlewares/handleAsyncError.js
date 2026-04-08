const handleAsyncError = (func) => {
  return function (req, res, next) {
    Promise.resolve(func(req, res, next)).catch(function (error) {
      next(error);
    });
  };
};

export default handleAsyncError;
