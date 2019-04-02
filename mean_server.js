const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const db_conn = "mongodb://localhost:27017/homework4";

mongoose.connect(db_conn, {
        useNewUrlParser: true
    })
    .then(() => {
        console.log("database connected");
    })
    .catch((e) => {
        console.log(e.message);
    });

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("server at localhost" + port);
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//way to create schema
const registerSchema = mongoose.Schema({
    "username": {
        type: String,
        // unique: true,
        required: true
    },
    "password": {
        type: String,
        // unique: true,
        required: true
    },
    "firstname": {
        type: String,
        required: true
    },
    "lastname": {
        type: String,
        required: true
    },
    "phone": {
        type: Number,
        //max: 12,
        required: true
    },
    "gender_val": {
        type: String,
        required: true
    }
});

const registerModel = mongoose.model("registers", registerSchema);

const messageSchema = mongoose.Schema({
    "username": {
        type: String,
        required: true
    },
    "messageTitle": {
        type: String,
        required: true
    },
    "messageBody": {
        type: String,
        required: true
    },
    "isImportant": {
        type: Boolean,
        default: false
    }
});

const messageModel = mongoose.model("messages", messageSchema);


app.post("/signup", async (req, res) => {
    try {
        // console.log(req.body);

        const check_data = await registerModel.find({
            username: req.body.username
            //  _id: req.body._id
        });
        // console.log(check_data[0]._id);
        if (check_data.length > 0) {

            // console.log("already registered, please sign in");
            res.sendFile(__dirname + '/public/views/login.html');
            //res.status(400).send(res.message);
        } else {

            const register_doc2 = new registerModel(req.body);
            register_doc2.save().then((result) => {
                res.status(200).send(result);
            }).
            catch((ex) => {
                res.status(400).send(ex.message);
            });
        }
    } catch (err) {
        res.status(400).send(err.message);
    }

    // const register_doc = new registerModel(req.body);
    // const result = await register_doc.save();
    // res.status(200).send(result);
    // console.log(result);

    // } catch (ex) {
    //     res.status(400).send(ex.message);
    // }

});


app.post("/login", async (req, res) => {
    try {
        const login_detail = req.body;
        //console.log(login_detail);
        const result = await registerModel.find({
            username: login_detail.username,
            password: login_detail.password
        });      
        if (result) {

            const token = jwt.sign({
                "username": result[0].username,
                "id": result[0]._id
            }, 'secretValue');
           // console.log("token");
            //console.log(token);

           // res.status(200).send({result,"token":token });
            res.json({
                status :200,
                "token":token,
                "data" : result
            });

        } 
        else {
            status: false
        }
    } catch (ex) {
        res.status(400).send(ex);
    }
});


app.use((req, res, next)=>{
 const token = req.headers.token;

    //console.log("token");
    //console.log(req.headers);

    if(!token){
        res.send("invalid");
    }
    else{
      jwt.verify(token, "secretValue", (err, decoded) =>{
  
        if(err){
          res.send("invalid token");
        }
        else{
          req.decoded = decoded;   
        //   console.log("in else");
        //   console.log(decoded);    
          next();
        }
      });
    } 
});


app.get("/messages", (req, res) => {
    
        //console.log(req.decoded);
        messageModel.find({username:req.decoded.username})
            .then((data) => {
                res.status(200).send(data);
                // console.log("from messages");
                // console.log(data);
                //console.log("body");
                //console.log(req.decoded);
            })
            .catch((ex) => {
                res.status(400).send(ex.message);
            })
});

app.post("/deleteMessage", (req,res)=>{

   // console.log(req.body);
    messageModel.deleteOne({_id: req.body.id})
        .then((data)=>{

            res.status(200).send(data);
           // console.log("data");
            //console.log(data);
        })
        .catch((ex) =>{
            res.status(400).send(ex.message);
        });
});

app.post("/details/:dId", (req,res)=>{


    messageModel.find({_id:req.body.id})
        .then((data)=>{

            res.status(200).send(data);
        })
        .catch((ex) =>{
            res.status(400).send(ex.message);
        });
});

app.post("/messages", (req, res)=>{

        const message_doc = new messageModel(req.body);
        message_doc.save().then((item) => {
        res.status(200).send(item);
        }).catch((ex)=>{
            res.status(400).send("invalid uername");
        });

});

app.post("/updateImp", (req,res)=>{
    
    messageModel.update({_id: req.body.id},{$set: {isImportant:req.body.isImportant }})
            .then((data) => {
                res.status(200).send(data);
                // console.log("from messages");
                console.log(data);
                //console.log("body");
                //console.log(req.decoded);
            })
            .catch((ex) => {
                res.status(400).send(ex.message);
            })
    // const message_doc = new messageModel(req.body);
    //     message_doc.save().then((item) => {
    //     res.status(200).send(item);
    //     }).catch((ex)=>{
    //         res.status(400).send("invalid uername");
    //     });

});

app.get("/userlist", (req,res)=>{
    
    registerModel.find({},{'username':1,'_id':0})
        .then((values_name) => {
          //  console.log("in then");
            //console.log(values_name);
           res.status(200).send(values_name);
            })
            .catch((ex)=>{
            res.status(400).send(ex);
            });
    

});

app.post("/deleteMessageFromDetails", (req,res)=>{

    console.log("from delete details");
    console.log(req.body);
     messageModel.deleteOne({_id: req.body.id})
         .then((data)=>{
 
             res.status(200).send(data);
            console.log("data");
             console.log(data);
         })
         .catch((ex) =>{
             res.status(400).send(ex.message);
         });
 });
