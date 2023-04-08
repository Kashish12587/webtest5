var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const express = require("express");
const exphbs = require("express-handlebars");
const { Pool } = require("pg");
const config = require("./config");

// connect to Your MongoDB Atlas Database
mongoose
  .connect(
    "mongodb+srv://Steve:steven1234@senecaweb.xcubkcr.mongodb.net/?retryWrites=true&w=majority"
  )
  .catch((err) => {
    console.log("Error connecting the Db. Error:", err);
  });

const app = express();
const pool = new Pool(config.database);

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

var taskSchema = new Schema({
  taskDesc: String,
  completed: {
    type: Boolean,
    default: false,
  },
});
var tasks = mongoose.model("tasks", taskSchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Routes
app.get("/", async (req, res) => {
  // const client = await pool.connect();
  // const result = await client.query('SELECT * FROM todos ORDER BY id');
  // const todos = result.rows;
  // client.release();
  // res.render('index', { todos, layout:false });
  tasks
    .find({})
    .lean()
    .exec()
    .then((todos) => {
      // companies will be an array of objects.
      // Each object will represent a document that matched the query
      // Convert the mongoose documents into plain JavaScript objects

      res.render("index", { todos, layout: false });
    });
});

app.post("/add", async (req, res) => {
  const task = req.body.task;

  if (task) {
    // const client = await pool.connect();
    // await client.query('INSERT INTO todos (task) VALUES ($1)', [task]);
    // client.release();
    var todo = new tasks({
      taskDesc: task,
    });
    todo
      .save()
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.log("There was an error saving the company. Err:", err);
      });
  } else {
    res.redirect("/");
  }
});

app.post("/complete/:id", async (req, res) => {
  const id = req.params.id;

  if (id) {
    // const client = await pool.connect();
    // await client.query('UPDATE todos SET completed = true WHERE id = $1', [id]);
    // client.release();
    tasks.findByIdAndUpdate(id, {completed: true}).exec().then(()=>{
      res.redirect("/");
    }).catch((err) => {
      console.log("Couldn't update the document, Error:", err);
    });
  } else {
    res.redirect("/");
  }
});

app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;

  if (id) {
    // const client = await pool.connect();
    // const result = await client.query('SELECT * FROM todos WHERE id = $1', [id]);
    // const todo = result.rows[0];
    // client.release();
    // res.render('edit', { todo, layout:false });
    tasks
      .findById(id)
      .lean()
      .exec()
      .then((todo) => {
        res.render("edit", { todo, layout: false });
      })
      .catch((err) => {
        console.log("Error reading the task. Error:", err);
      });
  } else {
    res.redirect("/");
  }
});

app.post("/update/:id", async (req, res) => {
  const id = req.params.id;
  const task = req.body.task;

  if (id && task) {
    // const client = await pool.connect();
    // await client.query('UPDATE todos SET task = $1 WHERE id = $2', [task, id]);
    // tasks
    //   .findByIdAndUpdate({ id }, { taskDesc: task })
    //   .exec()
    //   .then(() => {
    //     res.redirect("/");
    //   })
    //   .catch((err) => {
    //     console.log("Error Updating the Document. Error:", err);
    //   });

    tasks.findByIdAndUpdate(id, { taskDesc: task }).exec().then(()=>{
      res.redirect('/');
    }).catch((err)=>{
      console.log("Error Updating the Document. Error:", err);
    });
  } else {
    res.redirect("/");
  }
});

// Add this route after the existing routes
app.post("/delete/:id", async (req, res) => {
  const id = req.params.id;

  if (id) {
    // const client = await pool.connect();
    // await client.query('DELETE FROM todos WHERE id = $1', [id]);
    // client.release();
    tasks.findByIdAndRemove(id).exec().then(()=>{
      res.redirect('/');
    }).catch((err)=>{
      console.log("Error deleting the Document, Error:", err);
    })
  } else {
    res.redirect("/");
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
