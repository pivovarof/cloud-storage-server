const fs = require('fs');
const config = require('config');

class FileService {
  createDir(file) {
    const filePath = `${config.get('filePath')}\\${file.user}\\${file.path}`;
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath);
          return resolve({ message: 'File was created' });
        } else {
          reject({ message: 'File already exist' });
        }
      } catch (error) {
        console.log(error);
        return reject({ message: 'file error' });
      }
    });
  }
}

module.exports = new FileService();
