const NotesHandler = {
	getAllNotes(knex) {
		return knex.select('*').from('notes');
	},

	getNoteById(knex, noteid) {
		return knex
			.from('notes')
			.select('*')
			.where('id', noteid);
	},

	postNewNote(knex, newNote) {
		return knex
			.insert(newNote)
			.into('notes')
			.returning('*')
			.then(rows => {
				return rows[0];
			});
	},

	deleteNoteById(knex, id) {
		return knex('notes')
			.where({ id })
			.delete();
	}
};

module.exports = NotesHandler;
