let Rethink = require("./lib/rethink");



new Rethink().connect().then(() => rethink.sub({
    table: "choreographer_dot_update_hyphen_merchant",
    limit: 100,
    onRow: (err, row) => {
        console.log(err, row);
    }
}));

