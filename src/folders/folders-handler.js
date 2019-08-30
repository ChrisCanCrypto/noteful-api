const FoldersHandler = {
	getAllFolders(knex) {
		return knex.select('*').from('folders');
	},

	getFolderById(knex, id) {
		return knex
			.from('folders')
			.select('*')
			.where('id', id)
			.first();
	},

	postNewFolder(knex, newFolder) {
		return knex
			.insert(newFolder)
			.into('folders')
			.returning('*')
			.then(rows => {
				return rows[0];
			});
	}
};

module.exports = FoldersHandler;
