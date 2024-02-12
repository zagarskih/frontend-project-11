import validation from './validationSchema';
import onChange from 'on-change';
import render from './render';
import i18next from 'i18next';
import translationRU from './locales/ru.js';
import * as yup from "yup";
import axios from 'axios';

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
    links: [],
    // loadingStatus: null,
    textError: '',
    isError: false,
  };

  const state = onChange(initialState, handleRender);

  const form = document.getElementById('urlform');
  form.addEventListener('submit', handleSubmit);

  function handleSubmit(e) {
    e.preventDefault();

    const urlInput = document.getElementById('inputAddress');
    const url = urlInput.value;
    const addedLinks = [...state.links];
    validation(url, addedLinks, i18nextInstance)
      .then(() => {
        state.links.push(url);
        state.textError = 'interface.loadSuccess';
        state.validation = true;
        state.isError = false;
      })
      .catch((error) => {
        state.isError = true;
        state.validation = false;
        state.textError = error.message;
      });
  }

  function handleRender() {
    render(state, i18nextInstance);
  }
};
