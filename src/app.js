import i18next from 'i18next';
import * as yup from 'yup';
import { uniqueId } from 'lodash';
import axios from 'axios';
import render from './render';
import resources from './locales/index.js';
import parse from './parse';
import { observeChanges } from './render';

const validation = (url, links) => {
  const schema = yup
    .string()
    .trim()
    .url()
    .required()
    .notOneOf(links)
    .validate(url);
  return schema;
};

const makeId = (feed) => ({
  ...feed,
  id: uniqueId(),
  posts: feed.posts.map((post) => ({
    ...post,
    id: uniqueId(),
  })),
});

const refreshFeeds = (state) => {
  const promises = state.feeds.map((feed) => {
    const url = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
      feed.link,
    )}`;
    return axios.get(url, {
      timeout: 10000,
      params: {
        disableCache: true,
      },
    });
  });
  Promise.all(promises).then((responses) => {
    responses.forEach((resp, i) => {
      const data = resp.data.contents;
      const { link } = state.feeds[i];
      const { posts } = { link, ...parse(data) };
      const oldPostsLinks = state.posts.map((post) => post.link);
      const newPosts = posts.filter(
        (post) => !oldPostsLinks.includes(post.link),
      );
      const newPostsWithId = newPosts.map((post) => ({
        ...post,
        id: uniqueId(),
      }));
      state.posts = [...newPostsWithId, ...state.posts];
    });
    render(state);
    setTimeout(() => refreshFeeds(state), 5000);
  });
};

const addNewFeed = (link, state) => {
  const url = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(
    link,
  )}`;
  return axios
    .get(url, {
      timeout: 10000,
      params: {
        disableCache: true,
      },
    })
    .then((response) => {
      const data = response.data.contents;
      const { posts, ...feed } = { link, ...makeId(parse(data)) };
      state.status = 'success';
      state.feeds = [feed, ...state.feeds];
      state.posts = [...posts, ...state.posts];
    })
    .catch((error) => {
      state.status = 'failed';
      switch (error.name) {
        case 'AxiosError':
          state.error = 'errors.networkError';
          break;
        case 'TypeError':
          state.error = 'errors.invalidRSS';
          break;
        default:
          state.error = error.message;
          break;
      }
    });
};

export default function App() {
  const initialState = {
    feeds: [],
    posts: [],
    viewedPostsIds: new Set(),
    status: 'filling', // loading, success, failed, filling
    error: '',
    modalPostId: null,
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      lng: 'ru',
      resources,
    })
    .then(() => {
      yup.setLocale({
        string: {
          url: 'errors.urlInvalid',
          required: 'errors.urlRequired',
        },
        mixed: {
          notOneOf: 'errors.rssExists',
        },
      });
    });

  const state = observeChanges(initialState, i18nextInstance);

  const form = document.getElementById('urlform');

  function handleSubmit(e) {
    e.preventDefault();
    state.status = 'filling';

    const urlInput = document.getElementById('inputAddress');
    const url = urlInput.value;
    const addedLinks = state.feeds.map(({ link }) => link);

    validation(url, addedLinks, i18nextInstance)
      .then((value) => {
        state.status = 'loading';
        state.error = '';
        addNewFeed(value, state);
      })
      .catch((error) => {
        state.status = 'failed';
        state.error = error.message;
      });
  }

  form.addEventListener('submit', handleSubmit);

  const posts = document.getElementById('content');

  posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.readedLink;
    if (!postId) return;
    if (!state.viewedPostsIds.has(postId)) {
      state.viewedPostsIds.add(postId);
    }
    if (e.target.dataset.modalIndex) {
      state.modalPostId = e.target.dataset.modalIndex;
    }
  });
  refreshFeeds(state);
}
