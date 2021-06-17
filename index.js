let port = process.env.PORT || 80;

const app = require('./app');

// Start listening for requests.
app.listen(port, ()=>{
  console.log("Server is running on port ", port);
});

process.on('uncaughtException', err => console.error('uncaught exception:', err.toString()));
process.on('unhandledRejection', error => console.error('unhandled rejection:', error.toString()));
