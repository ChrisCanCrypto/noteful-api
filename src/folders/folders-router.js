const express = require('express');
const path = require('path');
const xss = require('xss');
const FoldersHandler = require('./folders-handler');

const foldersRouter = express.Router();
const jsonParser = express.json();

const sterilizeFolders = ({ id, name }) => ({
	id: id,
	name: xss(name)
});

foldersRouter
	.route('/')
	.get(handleGetFolders)
	.post(jsonParser, handlePostNewFolder);

foldersRouter
	.route('/:folderid')
	.all(handleGetFolderById)
	.get((req, res, next) => {
		res.json(sterilizeFolders(res.folder));
	});

function handleGetFolders(req, res, next) {
	FoldersHandler.getAllFolders(req.app.get('db'))
		.then(folders => {
			res.json(folders.map(sterilizeFolders));
		})
		.catch(next);
}

function handlePostNewFolder(req, res, next) {
	const { name } = req.body;
	const newFolder = { name };

	if (!name) {
		return res.status(400).jaon({
			error: { message: 'Missing name in request body' }
		});
	}

	FoldersHandler.postNewFolder(req.app.get('db'), newFolder)
		.then(folder => {
			res.status(201)
				.location(path.posix.join(req.originalUrl, `/${folder.id}`))
				.json(sterilizeFolders(folder));
		})
		.catch(next);
}

function handleGetFolderById(req, res, next) {
	FoldersHandler.getFolderById(req.app.get('db'), req.params.folderid)
		.then(folder => {
			if (!folder) {
				return res.status(404).json({ error: { message: 'Folder does not exist' } });
			}
			res.folder = folder;
			next();
		})
		.catch(next);
}

module.exports = foldersRouter;
