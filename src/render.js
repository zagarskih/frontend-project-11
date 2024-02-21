import createPosts from './components/createPosts';
import createFeeds from './components/createFeeds'

export default (state, i18nextInstance, path) => {
  const errorMessage = document.getElementById('errortext');
  const urlInput = document.getElementById('inputAddress');
  const postEl = document.getElementById('posts-container');
  const feedsEl = document.getElementById('feeds');
  const submitButton = document.getElementById('submitbtn');

  urlInput.focus();
  errorMessage.textContent = i18nextInstance.t(state.textError);

  switch (path) {
    case 'loadingStatus':
      if (state.loadingStatus === 'loading') {
        submitButton.setAttribute('disabled', true);
      } else {
        submitButton.removeAttribute('disabled');
      }
      break;

    case 'feeds':
      feedsEl.innerHTML = '';
      feedsEl.append(createFeeds(state, i18nextInstance));
      break;

    case 'posts':
      postEl.innerHTML = '';
      postEl.append(createPosts(state, i18nextInstance));
      break;

    case 'textError':
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
      break;
  }
};
