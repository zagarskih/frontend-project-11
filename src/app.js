import validation from './validationSchema';
import onChange from 'on-change';
import render from './render';
import i18next from 'i18next';
import translationRU from './locales/ru.js';
import * as yup from "yup";
import getResponse from './getResponse';
import updateFeed from './updateFeed';

export default function App() {
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

  let initialState = {
    validation: true,
    feeds: [],
    posts: [],
    loadingStatus: null, //loading, success
    textError: '',
    isError: false,
  };

  const state = onChange(initialState, handleRender);

  const form = document.getElementById('urlform');
  form.addEventListener('submit', handleSubmit);

  function refreshFeeds(state) {
    setTimeout(() => {
      const promises = state.feeds.map((feed) => getResponse(feed.link));
      Promise.all(promises)
        .then((responses) => {
          responses.forEach((feed) => {
            updateFeed(state, feed);
          });
        })
        .catch((error) => {
          console.error('Error refreshing feeds:', error);
        })
        .finally(() => {
          refreshFeeds(state);
        });
    }, 5000);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const urlInput = document.getElementById('inputAddress');
    const url = urlInput.value;
    const addedLinks = state.feeds.map(({ link }) => link);
    validation(url, addedLinks, i18nextInstance)
      .then((value) => {
        state.loadingStatus = 'loading';
        return getResponse(value, state, i18nextInstance);
      })
      .then((feed) => {
        state.loadingStatus = 'success';
        state.textError = 'interface.loadSuccess';
        updateFeed(state, feed);
        if (state.feeds.length !== 0) {
          refreshFeeds(state);
        }
        state.validation = true;
        state.isError = false;
      })
      .catch((error) => {
        state.isError = true;
        state.validation = false;
        state.loadingStatus = 'failed';
        state.textError = error.message;
      });
  }

  function handleRender(path) {
    render(state, i18nextInstance, path);
  }
};
