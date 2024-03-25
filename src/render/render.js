const createPost = (state, i18nextInstance) => {
  const { posts } = state;
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nextInstance.t('interface.posts');

  cardBody.append(h2);
  card.append(cardBody);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  card.append(ul);

  posts.forEach((post, i) => {
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    ul.append(li);

    const a = document.createElement('a');

    const isRead = state.viewedPostsIds.has(post.id);
    a.className = isRead ? ['fw-normal', 'link-secondary'].join(' ') : ['fw-bold'];

    a.dataset.readedLink = post.id;
    a.dataset.id = post.id;
    a.dataset.role = 'post';
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.setAttribute('href', post.link);
    a.textContent = post.title;

    a.addEventListener('click', () => {
      state.viewedPostsIds.add(post.id);
    });

    li.append(a);

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.modalIndex = i;
    button.dataset.readedLink = post.id;
    button.dataset.id = post.id;
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nextInstance.t('interface.preview');
    button.addEventListener('click', () => {
      state.viewedPostsIds.add(post.id);
    });
    li.append(button);
  });

  return card;
};

const createModal = (state) => {
  const post = state.posts[state.modalPostId];

  const title = document.querySelector('.modal-title');
  const description = document.querySelector('.modal-body');
  const link = document.querySelector('.full-article');

  title.textContent = post?.title || '';
  description.textContent = post?.description || '';
  link.setAttribute('href', post?.link || '');
};

const createFeed = (state, i18nextInstance) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nextInstance.t('interface.feeds');

  cardBody.append(h2);
  card.append(cardBody);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  card.append(ul);

  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    ul.append(li);

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    li.append(h3);

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(p);
  });

  return card;
};

export default function render(state, i18nextInstance, path) {
  const errorMessage = document.getElementById('errortext');
  const urlInput = document.getElementById('inputAddress');
  const postEl = document.getElementById('posts-container');
  const feedsEl = document.getElementById('feeds');
  const submitButton = document.getElementById('submitbtn');
  const links = document.querySelectorAll('a[data-role="post"]');

  links.forEach((link) => {
    const isRead = state.viewedPostsIds.has(link.dataset.id);
    link.className = getPostLinkClassName(isRead);
  });

  switch (path) {
    case 'status':
      if (state.status === 'loading') {
        submitButton.setAttribute('disabled', true);
      }
      if (state.status === 'success') {
        urlInput.value = '';
        urlInput.classList.remove('is-invalid');
        urlInput.classList.add('is-valid');
        errorMessage.classList.add('text-success');
        errorMessage.classList.remove('text-danger');
        errorMessage.textContent = i18nextInstance.t('interface.loadSuccess');
      }
      if (state.status === 'failed') {
        errorMessage.textContent = i18nextInstance.t(state.error);
        urlInput.classList.replace('is-valid', 'is-invalid');
        errorMessage.classList.replace('text-success', 'text-danger');
        submitButton.removeAttribute('disabled');
      }
      if (state.status === 'filling') {
        errorMessage.textContent = '';
      } else {
        submitButton.removeAttribute('disabled');
      }
      break;

    case 'feeds':
      feedsEl.innerHTML = '';
      feedsEl.append(createFeed(state, i18nextInstance));
      break;

    case 'posts':
      postEl.innerHTML = '';
      postEl.append(createPost(state, i18nextInstance));
      break;

    case 'error':
      errorMessage.textContent = i18nextInstance.t(state.error);
      urlInput.classList.remove('is-valid');
      urlInput.classList.add('is-invalid');
      errorMessage.classList.remove('text-success');
      errorMessage.classList.add('text-danger');
      break;

    case 'modalPostId':
      createModal(state);
      break;

    default:
      break;
  }
}
