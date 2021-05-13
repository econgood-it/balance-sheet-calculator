import i18next from 'i18next';
import Backend from 'i18next-node-fs-backend';
import path from 'path';

i18next.use(Backend).init({
  backend: {
    loadPath: path.join(__dirname, '/files/locales/{{ns}}/{{lng}}.json'),
  },
  ns: ['v5'],
  preload: ['de', 'en'],
});

export default i18next;
