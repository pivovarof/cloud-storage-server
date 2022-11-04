const { Schema, model, ObjectId } = require('mongoose');

const File = new Schema({
  name: { type: String, require: true },
  type: { type: String, require: true },
  accessLink: { type: String },
  size: { type: Number, default: 0 },
  path: { type: String, default: '' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  parent: { type: Schema.Types.ObjectId, ref: 'File' },
  childs: [{ type: Schema.Types.ObjectId, ref: 'File' }],
});

module.exports = model('File', File);
