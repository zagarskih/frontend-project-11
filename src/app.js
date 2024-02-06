import validation from './validationSchema';
import onChange from 'on-change';
import render from './render';
import axios from 'axios';

export default function App() {
  let initialState = {
    validation: true,
    links: [],
    // loadingStatus: null,
    textError: '',
    isError: false,
  };

  const state = onChange(initialState, render);

  const form = document.getElementById('urlform');
  form.addEventListener('submit', handleSubmit);

  function handleSubmit(e) {
    e.preventDefault();

    const urlInput = document.getElementById('inputAddress');
    const url = urlInput.value;
    const addedLinks = [...state.links];
    console.log(addedLinks);
    validation(url, addedLinks)
      .then(() => {
        state.links.push(url);
        state.textError = '';
        state.validation = true;
        state.isError = false;
        render(state);
      })
      .catch((error) => {
        state.isError = true;
        state.validation = false;
        state.textError = error.message;
        render(state);
      });
  }
}
