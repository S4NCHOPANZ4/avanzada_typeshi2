if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({
      path: "./config/.env",
    });
  }
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
const cors = require('cors')
const connectDB = require('./db/db_connection.js')

//routes 
const app = express();
const port = process.env.PORT || 3030;
const userRoutes = require('./routes/user/user_routes.js');
const spaceRoutes = require('./routes/space/space_routes.js');
const postRoutes = require('./routes/post/posts_routes.js');
const notificationRoutes = require('./routes/notification/notification_routes.js');
const commentRoutes = require('./routes/comments/comment_routes.js');
//app use middlewares
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));
  

// Connect to DB
connectDB();


//routes 
app.use('/user', userRoutes);
app.use('/space', spaceRoutes);
app.use('/post', postRoutes);
app.use('/notification', notificationRoutes);
app.use('/comments', commentRoutes);
app.use('/', (req, res) =>{
    res.send('Test Route Running!')
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});