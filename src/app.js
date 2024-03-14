import onChange from 'on-change';
import render from './render';
import i18next from 'i18next';
import translationRU from './locales/ru.js';
import * as yup from "yup";
import { uniqueId } from 'lodash';
import axios from 'axios';
import parse from './parse.js'

const validation = (url, links) => {
  const schema = yup.string()
      .trim()
      .url()
      .required()
      .notOneOf(links)
      .validate(url)
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

const addNewFeed = (link, state) => { 
  const url = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}`;
  return axios.get(url, {
    timeout: 1000,
    params: {
      disableCache: true,
    }
  }).then((response) => {
    const data = response.data.contents;
    const feed = parse(data, link);
    state.feeds = [makeId(feed), ...state.feeds];
    state.posts = state.feeds.reduce((acc, item) => [...acc, ...item.posts], []);
    state.status = 'success';
  }).catch((error) => {
    state.status = 'failed';
    if (error.code === 'ERR_NETWORK') {
      throw new Error('errors.networkError');
    } else {
      throw new Error(error.message);
    }
  })
};

export default function App() {
  let initialState = {
    validation: true,
    feeds: [],
    posts: [],
    viewedPostsIds: [],
    status: null, //loading, success, failed, filling
    textError: '',
    isError: false,
    modalPostId: null,
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    resources: {
      ru: {
        translation: translationRU,
      },
    },
  }).then(() => {
    yup.setLocale({
      string: {
        url: 'errors.urlInvalid',
        required: 'errors.urlRequired',
      },
      mixed: {
        notOneOf: 'errors.rssExists',
      }
    })
  });

  const state = onChange(initialState, (path) => render(state, i18nextInstance, path));

  const form = document.getElementById('urlform');

  const refreshFeeds = () => {
    if (state.feeds.length > 0) {
      const promises = state.feeds.map((feed) => {
        const url = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(feed.link)}`;
        return axios.get(url, { timeout: 10000 })
          .then((resp) => {
            const data = resp.data.contents;
            return parse(data, feed.link);
          }).catch((e) => {
            console.error(e.message);
          });
      });
      Promise.all(promises).then((responses) => {
        responses.forEach((feed) => {
          const oldFeedIndex = state.feeds.findIndex((item) => item.link === feed.link);
          const oldFeed = state.feeds[oldFeedIndex];
          const oldPostsLinks = oldFeed.posts.map((post) => post.link);
          const newPosts = feed.posts.filter((post) => !oldPostsLinks.includes(post.link));
          const oldPosts = feed.posts.filter((post) => oldPostsLinks.includes(post.link));
          const newPostsWithId = newPosts.map((post) => ({ ...post, id: uniqueId() }));
          const updatedPosts = [...newPostsWithId, ...oldPosts];
          state.feeds[oldFeedIndex] = { ...feed, id: oldFeed.id, posts: updatedPosts };
          state.posts = state.feeds.reduce((acc, item) => [...acc, ...item.posts], []);
        });
      });
    };

    setTimeout(refreshFeeds, 5000);
  };

  function handleSubmit(e) {
    e.preventDefault();
    state.status = 'filling';

    const urlInput = document.getElementById('inputAddress');
    const url = urlInput.value;
    const addedLinks = state.feeds.map(({ link }) => link);
    validation(url, addedLinks, i18nextInstance)
        .then((value) => {
          state.status = 'loading';
          addNewFeed(value, state);
        })
        .catch((error) => {
          state.status = 'failed';
          state.error = error.message;
        });
  };

  form.addEventListener('submit', handleSubmit);

  const posts = document.getElementById('content');
  posts.addEventListener('click', (e) => {
    const readPost = state.viewedPostsIds;
    if (e.target.dataset.readedLink && !readPost.includes(e.target.dataset.readedLink)) {
      state.viewedPostsIds.push(e.target.dataset.readedLink);
    }
    if (e.target.dataset.modalIndex) {
      state.modalPostId = e.target.dataset.modalIndex;
    }
  });
  refreshFeeds();
};
