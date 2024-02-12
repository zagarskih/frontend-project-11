
export default (state, i18nextInstance) => {
  const errorMessage = document.getElementById('errortext');
  const urlInput = document.getElementById('inputAddress');

  urlInput.focus();
  errorMessage.textContent = i18nextInstance.t(state.textError);
  if (state.isError) {
    urlInput.classList.add('is-invalid');
    errorMessage.classList.remove('text-success');
    errorMessage.classList.add('text-danger');
  } else {
    urlInput.classList.remove('is-invalid');
    urlInput.value = '';
    errorMessage.classList.remove('text-danger');
    errorMessage.classList.add('text-success');
  }
};
