import axios from 'axios';
import { LANGUAGE_VERSIONS, PISTON_LANGUAGE_MAP, FILE_EXTENSIONS } from './Utils/constants';

const API_URL = axios.create({
  baseURL: '/api/code',
});

export const executeCode = async (language: keyof typeof LANGUAGE_VERSIONS, code: string) => {
  const response = await API_URL.post('/execute', {
    language: PISTON_LANGUAGE_MAP[language],
    version: LANGUAGE_VERSIONS[language],
    files: [
      {
        name: `index${FILE_EXTENSIONS[language]}`,
        content: code,
      }
    ],
  });
  return response.data;
};
