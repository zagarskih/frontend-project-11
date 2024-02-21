import axios from 'axios';
import parse from './parse.js';

export default (link) => { 
  const url = `https://allorigins.hexlet.app/get?url=${encodeURIComponent(link)}`;
  return axios.get(url, {
    timeout: 1000,
    params: {
      disableCache: true
    }
  }).then((response) => {
    const data = response.data.contents;
    return parse(data, link);
  }).catch((error) => {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('errors.networkError');
    } else {
      throw new Error(error.message);
    }
  })
};