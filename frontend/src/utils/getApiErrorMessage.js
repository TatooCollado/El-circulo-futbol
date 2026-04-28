export const getApiErrorMessage = (error) => {
  const validationErrors = error.response?.data?.errors;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors[0].message;
  }

  return error.response?.data?.message || "Ocurrio un error. Intentalo nuevamente.";
};

