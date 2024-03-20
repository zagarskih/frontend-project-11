import onChange from 'on-change';
import render from './render/render';
import i18next from 'i18next';
import translationRU from './locales/ru.js';
import * as yup from 'yup';
import { uniqueId } from 'lodash';
import axios from 'axios';
import parse from './parse.js';

const UPDATE_INTERVAL = 5000;

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
  if (state?.feeds && state.feeds.length > 0) {
    const promises = state.feeds.map((feed) => {
      const url = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
        feed.link
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
        const link = state.feeds[i].link;
        const { posts } = parse(data, link);
        const oldPostsLinks = state.posts.map((post) => post.link);
        const newPosts = posts.filter(
          (post) => !oldPostsLinks.includes(post.link)
        );
        const newPostsWithId = newPosts.map((post) => ({
          ...post,
          id: uniqueId(),
        }));
        state.posts = [...newPostsWithId, ...state.posts];
      });
      render(state);
      setTimeout(() => refreshFeeds(state), UPDATE_INTERVAL);
    });
  } else {
    setTimeout(() => refreshFeeds(state), UPDATE_INTERVAL);
  }
};

const addNewFeed = (link, state) => {
  const url = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(
    link
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
      const { posts, ...feed } = makeId(parse(data, link));
      state.status = 'success';
      state.feeds = [feed, ...state.feeds];
      state.posts = [...posts, ...state.posts];
      console.log(state.status);
    })
    .catch((e) => {
      state.status = 'failed';
      if (e.code === 'ERR_NETWORK') {
        state.error = 'errors.networkError';
      } else {
        state.error = e.message;
      }
      console.log(state.status);
    });
};

export default function App() {
  let initialState = {
    feeds: [],
    posts: [],
    viewedPostsIds: new Set(),
    status: 'filling', //loading, success, failed, filling
    error: '',
    // isError: false,
    modalPostId: null,
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      lng: 'ru',
      resources: {
        ru: {
          translation: translationRU,
        },
      },
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

  const state = onChange(initialState, (path) =>
    render(state, i18nextInstance, path)
  );

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
    if (
      e.target.dataset.readedLink &&
      !state.viewedPostsIds.has(e.target.dataset.readedLink)
    ) {
      state.viewedPostsIds.add(e.target.dataset.readedLink);
      console.log(e.target.dataset);
    }
    if (e.target.dataset.modalIndex) {
      state.modalPostId = e.target.dataset.modalIndex;
      console.log(e.target.dataset);
    }
  });
  refreshFeeds(state);
}
