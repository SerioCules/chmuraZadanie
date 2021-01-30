var express = require('express');
var router = express.Router();
const { Connection, Request } = require("tedious");

var data = {}

const config = {
  authentication: {
    options: {
      userName: "serwerkrystian",
      password: "natalia123@"
    },
    type: "default"
  },
  server: "serwerkrystian.database.windows.net",
  options: {
    database: "BD1",
    encrypt: true
  }
};


const connection = new Connection(config);

connection.on("connect", err => {
  if (err) {
    console.error(err.message);
  } else {
    createDatabase();
  }
});

function createDatabase() {
  const request = new Request(
    `CREATE TABLE notes ( note_id varchar(255), note_text varchar(8000) )`,
    (err, rowCount) => {
      if (err) {
        console.error("DB");
      } else {
        console.log(`${rowCount} row(s) affected`);
      }
      queryDatabase()
    }
  );

  connection.execSql(request);
}

function queryDatabase() {
  const request = new Request(
    `SELECT * FROM notes`,
    (err, rowCount) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`${rowCount} row(s) returned`);
      }
    }
  );

  request.on("row", columns => {
    data[columns[0].value] = columns[1].value
  });

  data = {}
  connection.execSql(request);
}

function queryDatabaseWithResponse(res, id) {
  const request = new Request(
    `SELECT * FROM notes`,
    (err, rowCount) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`${rowCount} row(s) returned`);
        res.redirect('/' + id)
      }
    }
  );

  request.on("row", columns => {
    data[columns[0].value] = columns[1].value
  });

  data = {}
  connection.execSql(request);
}

function updateDatabase(text, id, res) {
  const request = new Request(
    `UPDATE notes SET note_text = '` + text + `' WHERE note_id = '` + id + `'`,
    (err, rowCount) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`${rowCount} row(s) updated`);
        queryDatabaseWithResponse(res, id)
      }
    }
  );

  connection.execSql(request);
}

function addToDatabase(text, id, res) {
  const request = new Request(
    `INSERT INTO notes VALUES ('` + id + `', '` + text + `')`,
    (err, rowCount) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`${rowCount} row(s) added`);
        queryDatabaseWithResponse(res, id)
      }
    }
  );

  connection.execSql(request);
}


connection.connect()

router.get('/', function(req, res, next) {
  res.render('main', { title: 'Notepad', content: '' });
});

router.get('/:noteid', function(req, res, next) {
  res.render('index', { path: '/' + req.params['noteid'], title: 'Notepad "' + req.params['noteid'] + '"', content: data[req.params['noteid']] });
});

router.post('/load/id/', function(req, res, next) {
  res.redirect('/' + req.body.content)
});

router.post('/:noteid', function(req, res, next) {
  if (req.params['noteid'] in data) {
    updateDatabase(req.body.content, req.params['noteid'], res)
  }
  else {
    addToDatabase(req.body.content, req.params['noteid'], res)
  }
});

module.exports = router;
