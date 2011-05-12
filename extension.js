// Sample extension code, makes clicking on the panel show a message
const St = imports.gi.St;
const Mainloop = imports.mainloop;

const Main = imports.ui.main;
const Search = imports.ui.search;
const AppDisplay = imports.ui.appDisplay;
const GLib = imports.gi.GLib;

// Put your extension initialization code here
function main() {

    let migemo = new MigemoSearchProvider();

    Main.overview.viewSelector.addSearchProvider(migemo);

   Search.SearchSystem.prototype.updateSearch_orig = Search.SearchSystem.prototype.updateSearch;
    Search.SearchSystem.prototype.updateSearch = function(searchString){
	let results = this.updateSearch_orig(searchString);
	let res = migemo.getResultSet(searchString);
	if(res.length > 0){
	    results.push([migemo, res]);
	}
	return results;
    }
}

function MigemoSearchProvider() {
    this._init();
}

MigemoSearchProvider.prototype = {
    __proto__: AppDisplay.BaseAppSearchProvider.prototype,

    _init: function() {
        AppDisplay.BaseAppSearchProvider.prototype._init.call(this, "migemo");
    },

    getInitialResultSet: function(terms) {
	// dummy
	return [];
    },

    getSubsearchResultSet: function(previousResults, terms) {
	// dummy
	return [];
    },

    getResultSet: function(terms) {
	if(terms.length < 3) { return []; }

	let migemo_ret = GLib.spawn_command_line_sync('/bin/sh -c "migemo-client ' + terms + ' |nkf -w8"');
	global.logError(migemo_ret);
	if(!migemo_ret[0]){ return []; }

	let searchString = migemo_ret[1].replace(/(\n|\r)+$/, '');
	let regexp = new RegExp(searchString);
	let apps = this._appSys.get_flattened_apps(); // get all apps
	return apps.filter(function(app){
			       return -1 < app.get_name().search(regexp);
			   }).map(function(app){ return app.get_id();});
    },

    createResultActor: function (resultMeta, terms) {
        let app = this._appSys.get_app(resultMeta['id']);
        let icon = new AppDisplay.AppWellIcon(app);
        return icon.actor;
    }
};
