var CommandHandler = require('./commandHandler');
var util = util = require('util');
const fs = require('fs');
var displayManager = require('../displayManager')

let listDir;

function ListDir() {
  CommandHandler.apply(this, ["list", true]);
  listDir = this;

  this.currentIndex = 0;
  this.listDirPath = {};
  this.listDirPath['music'] = "./sample_audio";
  this.listDirPath['workspace'] = "..";
  this.listDirPath['documents'] = "../../..";
  this.listDirPath['home'] = "../../../..";
  this.fileList = [];
}

util.inherits(ListDir, CommandHandler);

ListDir.prototype.listDir = function(deferred, path) {
  this.currentIndex = 0;
  fs.readdir(path, function(err, items) {
    if (err) {
      listDir.processor.setPath('');
      displayManager.displayStatusBar(err);
      deferred.resolve(true);
      return;
    }
    listDir.fileList = items;
    listDir.currentIndex = displayManager.updateList(
        listDir.processor.getPath(),
        listDir.fileList,
        listDir.currentIndex);
    displayManager.displayList();
    deferred.resolve(true);
  });
}

ListDir.prototype.move = function(deferred, dir) {
  this.processor.appendPath(dir);
  let path = this.processor.getPath();
  if (fs.lstatSync(path).isDirectory()) {
    this.listDir(deferred, path);
  } else {
    deferred.resolve(true);
    this.processor.handleCommand("go");
  }
}

ListDir.prototype.processCommand = function(term) {
  let deferred = $.Deferred();

  // to be used without specifying folder name
  if (term == undefined) {
    let path = this.listDirPath['documents'];
    this.processor.setPath(path);
    this.listDir(deferred, path);
  } else if (term in this.listDirPath) {
    let path = this.listDirPath[term];
    this.processor.setPath(path);
    this.listDir(deferred, path);
  } else if (term == "right") {
    this.currentIndex = displayManager.updateList(
        this.processor.getPath(),
        this.fileList,
        this.currentIndex);
    deferred.resolve(true);
  } else if (term == "left") {
    this.currentIndex -= displayManager.listSize * 2;
    if (this.currentIndex < 0) this.currentIndex = 0;
    this.currentIndex = displayManager.updateList(
        this.processor.getPath(),
        this.fileList,
        this.currentIndex);
    deferred.resolve(true);
  } else if (term == "one") {
    let index = this.currentIndex - displayManager.listSize;
    if (index < 0) index = 0;
    this.move(deferred, this.fileList[index]);
  } else if (term == "two") {
    let index = this.currentIndex - displayManager.listSize;
    if (index < 0) index = 0;
    this.move(deferred, this.fileList[index+1]);
  } else if (term == "three") {
    let index = this.currentIndex - displayManager.listSize;
    if (index < 0) index = 0;
    this.move(deferred, this.fileList[index+2]);
  } else if (term == "four") {
    let index = this.currentIndex - displayManager.listSize;
    if (index < 0) index = 0;
    this.move(deferred, this.fileList[index+3]);
  } else if (term == "five") {
    let index = this.currentIndex - displayManager.listSize;
    if (index < 0) index = 0;
    this.move(deferred, this.fileList[index+4]);
  } else if (term == "up") {
    let path_arr = this.processor.getPath().split('/');
    path_arr.pop();
    let path = path_arr.join('/');
    this.processor.setPath(path);
    this.listDir(deferred, path);
  } else {
    // displayManager.displayStatusBar("valid command : right, left, 1, 2, 3, 4, 5, go, up");
    deferred.reject();
  }

  return deferred.promise();
}

ListDir.prototype.getCurrentPath = function() {
  return this.path;
}

module.exports = ListDir;
