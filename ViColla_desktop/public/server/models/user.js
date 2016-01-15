/**
 * Created by antony on 06.12.2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = Schema({
    username: String,
    password: String,
    email: String,
    phone: String,
    address: String,
    firstName: String,
    lastName: String,
    birthDate: Date,
    designation: String,
    isExpert: Boolean,
    tags: [String],
    logoFilename: String,
    status: Boolean
});


// methods ======================
// generating a hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
var User = mongoose.model('User', userSchema);

var callHistorySchema = Schema({
    _caller: {type: Schema.Types.ObjectId, ref: 'User'},
    _receiver: {type: Schema.Types.ObjectId, ref: 'User'},
    callerFirstName: String,
    callerLastName: String,
    callerDesignation: String,
    callername: String,
    receivername: String,
    status: String,
    startDate: Date,
    duration: Number
});

var CallHistory = mongoose.model('CallHistory', callHistorySchema);


var imagesSnapshotSchema = Schema({
    duration: Number,
    playbackTime: Number,
    description: String,
    videoName: String,
    dataURL: String
});

var ImageSnapshot = mongoose.model("ImageSnapshot", imagesSnapshotSchema);


module.exports = {
    User: User,
    CallHistory: CallHistory,
    ImageSnapshot: ImageSnapshot
};