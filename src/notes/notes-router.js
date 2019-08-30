const express = require('express');
const path = require('path');
const xss = require('xss');
const NotesHandler = require('./notes-handler');

const notesRouter = express.Router();
const jsonParser = express.json();

const sterilizeNotes = ({ id, folderid, name, modified, content }) => ({
	id: id,
	folderid: folderid,
	name: xss(name),
	modified: modified,
	content: xss(content)
});

notesRouter
	.route('/')
	.get(handleGetNotes)
	.post(jsonParser, handlePostNewNote);

notesRouter
	.route('/:noteid')
	.all(handleGetNoteById)
	.get((req, res, next) => {
		return res.json(sterilizeNotes(res.note));
	})
	.delete(handleDeleteNoteById);

function handleGetNotes(req, res, next) {
	NotesHandler.getAllNotes(req.app.get('db'))
		.then(notes => {
			res.json(notes.map(sterilizeNotes));
		})
		.catch(next);
}

function handlePostNewNote(req, res, next) {
	const { name, folderid, content, modified } = req.body;
	const newNote = { name, folderid, content, modified };

	NotesHandler.postNewNote(req.app.get('db'), newNote)
		.then(note => {
			res.status(201)
				.location(path.posix.join(req.originalUrl, `/${note.id}`))
				.json(sterilizeNotes(note));
		})
		.catch(next);
}

function handleGetNoteById(req, res, next) {
	NotesHandler.getNoteById(req.app.get('db'), req.params.noteid)
		.then(note => {
			if (!note) {
				return res.status(404).json({ error: { message: 'Note does not exist' } });
			}
			res.note = note;
			next();
		})
		.catch(next);
}

function handleDeleteNoteById(req, res, next) {
	NotesHandler.deleteNoteById(req.app.get('db'), req.params.noteid)
		.then(() => {
			res.status(204).end();
		})
		.catch(next);
}

module.exports = notesRouter;
