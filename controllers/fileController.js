const config = require('config');
const fs = require('fs');

const fileService = require('../services/fileService');
const User = require('../models/User');
const File = require('../models/File');

class FileController {
  async createDir(req, res) {
    try {
      const { name, parent, type } = req.body;
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
      const { sort } = req.query;
      let files;
      switch (sort) {
        case 'type':
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ type: 1 });
          break;
        case 'date':
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ date: 1 });
          break;
        case 'name':
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ name: 1 });
          break;
        case 'size':
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ size: 1 });
          break;

        default:
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          });
          break;
      }

      return res.json(files);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Can not get files' });
    }
  }
  async uploadFile(req, res) {
    try {
      const file = req.files.file;
      const parent = await File.findOne({
        user: req.user.id,
        _id: req.body.parent,
      });
      const user = await User.findOne({ _id: req.user.id });

      if (user.usedSpace + file.size > user.diskSpace) {
        res.status(400).json({ message: 'There no space on the disk' });
      }
      user.usedSpace += file.size;

      const findParent = async (par) => {
        if (par.parent) {
          const parentId = await File.findOne({
            _id: par.parent,
          });
          parentId.size += file.size;
          await parentId.save();
          findParent(parentId);
        }
      };
      let path;

      if (parent) {
        path = `${config.get('filePath')}\\${user._id}\\${parent.path}\\${
          file.name
        }`;
        parent.size += file.size;
        await parent.save();
        findParent(parent);
      } else {
        path = `${config.get('filePath')}\\${user._id}\\${file.name}`;
      }
      if (fs.existsSync(path)) {
        return res.status(400).json({ message: 'File already exists' });
      }

      file.mv(path);

      const type = file.name.split('.').pop();
      let filePath = file.name;
      if (parent) {
        filePath = parent.path + '\\' + file.name;
      }

      const dbFile = new File({
        name: file.name,
        type,
        size: file.size,
        path: filePath,
        parent: parent?._id,
        user: user._id,
      });

      await dbFile.save();
      if (dbFile.parent) {
        const parent = await File.findOne({ _id: dbFile.parent });
        parent.childs.push(dbFile._id);
        await parent.save();
      }

      await user.save();

      res.json(dbFile);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Upload Error' });
    }
  }

  async downloadFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });
      const path = fileService.getPath(file);

      if (fs.existsSync(path)) {
        return res.download(path, file.name);
      }
      return res.status(400).json({ message: 'File not found' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Download error' });
    }
  }

  async deleteFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });
      const user = await User.findOne({ _id: req.user.id });
      // const delChild = async (files) => {
      //   if (files.childs.length !== 0) {
      //     files.childs.forEach(async (child) => {
      //       const fileChild = await File.findOne({ _id: child });

      //       if (fileChild.childs.length !== 0) {
      //         delChild(fileChild.childs);
      //       } else {
      //         fileService.deleteFile(fileChild);
      //         await fileChild.remove();
      //         fileService.deleteFile(files);
      //         await files.remove();
      //       }
      //     });
      //   } else {
      //     fileService.deleteFile(files);
      //     await files.remove();
      //   }
      // };
      // delChild(file);
      const findParent = async (par) => {
        if (par.parent) {
          const parentId = await File.findOne({
            _id: par.parent,
          });
          parentId.size -= file.size;
          await parentId.save();
          findParent(parentId);
        }
      };
      if (file.parent) {
        const parent = await File.findOne({
          _id: file.parent,
        });
        parent.size -= file.size;
        let i = parent.childs.indexOf(file._id);
        parent.childs.splice(i, 1);
        await parent.save();
        findParent(parent);
      }
      if (!file) {
        return res.status(400).json({ message: 'file not found' });
      }

      user.usedSpace -= file.size;
      fileService.deleteFile(file);
      await file.remove();
      await user.save();
      return res.json({ message: 'file has been deleted' });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Dir is not empty' });
    }
  }
  async searchFiles(req, res) {
    try {
      const searchName = req.query.search;
      let files = await File.find({
        user: req.user.id,
      });
      files = files.filter((file) => file.name.includes(searchName));

      return res.json(files);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: 'Search error' });
    }
  }
}

module.exports = new FileController();
