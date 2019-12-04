var express = require('express');
var router = express.Router();

let settings = {
    studentStatus: ['active', 'finish', 'freez'],
    studentSpecialty :['IT', 'Medicine', 'Journalism'],
    certificationStatus: ['no', 'yes',],
    groupStatus: ['potential','active', 'finish', 'all'],
    groupLevel: ['א', 'ב', 'ג', 'ד'],
    groupTime: ['morning', 'noon', 'evning'],
    groupTeacher: ['Shoshi', 'Mira', 'Zeev'],
}

router.get('/', function(req, res, next) {
    res.send(settings);
});
module.exports = router;