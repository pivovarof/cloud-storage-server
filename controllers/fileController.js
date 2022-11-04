const fileService = require('../services/fileService');
const User = require('../models/User');
const File = require('../models/File');

class FileController {
  async createDir(req, res) {
    try {
      const { name, parent, type } = req.body;
      console.log(req.body);
      const file = new File({ name, parent, type, user: req.user.id });
      const parentFile = await File.findOne({ _id: parent });
      if (!parentFile) {
        file.path = name;
        await fileService.createDir(file);
      } else {
        file.path = `${parentFile.path}\\${file.name}`;
        await fileService.createDir(file);
        parentFile.childs.push(file._id);
        await parentFile.save();
      }
      await file.save();
      return res.json(file);
    } catch (e) {
      console.log(e);
      res.status(400).json(e);
    }
  }
  async getFile(req, res) {
    try {
      const files = await File.find({
        user: req.user.id,
        parent: req.query.parent,
      });
      return res.json({ files });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Can not get files' });
    }
  }
}

module.exports = new FileController();
