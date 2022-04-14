import * as fs from 'fs';

export const createFolder = () => {
  if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
  }
}

const checkMessage = (src: string) => {
  if (fs.existsSync(src)) {
    const read = fs.readFileSync(src, 'utf-8').split('\n');
    return read.slice(-10).join('\n');
  }
  else return '';
}

export const createLog = (typeLog: string, message: string, optionalParams?: any[]) => {
  createFolder();
  const path = `logs/${typeLog}.txt`;
  const mess = checkMessage(path);
  const res = `${new Date()} ${message} ${optionalParams}`;
  switch (typeLog) {
    case 'log': {
      fs.writeFileSync(path, `${mess}\n${res}`);
      break;
    }
  }

}