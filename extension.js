// Sample extension code, makes clicking on the panel show a message
const St = imports.gi.St;
const Mainloop = imports.mainloop;

const Gettext = imports.gettext.domain('gnome-shell');
const _ = Gettext.gettext;

const Main = imports.ui.main;

const Search = imports.ui.search;
const AppDisplay = imports.ui.appDisplay;

function _showHello() {
    let text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
    let monitor = global.get_primary_monitor();
    global.stage.add_actor(text);
    text.set_position(Math.floor (monitor.width / 2 - text.width / 2), Math.floor(monitor.height / 2 - text.height / 2));
    Mainloop.timeout_add(3000, function () { text.destroy(); });
}

// Put your extension initialization code here
function main() {
//    Main.panel.actor.reactive = true;
//    Main.panel.actor.connect('button-release-event', _showHello);
    Main.overview.viewSelector.addSearchProvider(new MigemoSearchProvider());
}

function MigemoSearchProvider() {
    this._init();
}

MigemoSearchProvider.prototype = {
    __proto__: AppDisplay.BaseAppSearchProvider.prototype,

    _init: function() {
         AppDisplay.BaseAppSearchProvider.prototype._init.call(this, _("APPLICATIONS"));
    },

    getInitialResultSet: function(terms) {
        return this._appSys.initial_search(false, terms);
    },

    getSubsearchResultSet: function(previousResults, terms) {
        return this._appSys.subsearch(false, previousResults, terms);
    },

    createResultActor: function (resultMeta, terms) {
        let app = this._appSys.get_app(resultMeta['id']);
        let icon = new AppDisplay.AppWellIcon(app);
        return icon.actor;
    }
};
