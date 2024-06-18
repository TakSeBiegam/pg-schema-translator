import * as fs from 'fs';

export const welcome = async (): Promise<void> => {
  const logo = fs.readFileSync('public\\cli\\asci.txt', 'utf8');
  return new Promise((resolve) => {
    console.log(logo);
    resolve();
  });
};
