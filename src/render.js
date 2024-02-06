export default (state) => {
  const errorMessage = document.getElementById('errortext');
  const urlInput = document.getElementById('inputAddress');
  if (!state.validation) {
    errorMessage.textContent = state.textError;
    urlInput.classList.add('is-invalid');
  } else {
    urlInput.classList.remove('is-invalid');
  }
};
