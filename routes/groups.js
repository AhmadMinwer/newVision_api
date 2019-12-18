var express = require('express');
var mysql = require('mysql')
var router = express.Router();

var bodyParser = require('body-parser');
const app = express();
// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//DB connection settings 
//NOTE : typo in newvision
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'newvision'
})

connection.connect(function (err) {
  if (err) throw err
  console.log('You are now connected to newvision database...')


  //add group API
  router.post('/api/v1/groups/add', function (req, res, next) {

    const group = req.body.group
    console.log(req.body)


    // group.name is required
    if (group.name && group.name == '') {
      return res.status(400).send({
        success: 'false',
        message: 'group name is required'
      });
    }

    let stmt = `INSERT INTO groups (name, level, time, status, commited_lessons, starting_date, finishing_date, remarks, teacher1, teacher2 ) VALUES (?,?,?,?,?,DATE(?), DATE(?) ,?,?,?)`;
    let values = [group.name.toLowerCase(),
    group.level.toLowerCase(),
    group.time.toLowerCase(),
    group.status.toLowerCase(),
    group.numberOfLessons,
    group.startingDate,
    group.finishingDate,
    group.remarks.toLowerCase(),
    group.teacher1.toLowerCase(),
    group.teacher2.toLowerCase(),
    ];

    connection.query(stmt, values, (err, results, fields) => {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'group did not added successfully',
          err,
        });
      }

      console.log('resulsts = ' + results)

      group['id'] = results.insertId

      return res.status(200).send({
        success: 'true',
        message: 'group added successfully',
        group,
      })


    });
  })


  
  router.post('/api/v1/groups/fetch', function (req, res, next) {

    let filters = req.body.filters

    // console.log('/groups/fetch   is called ')
    console.log(filters)

    let stmt = 'SELECT groups.*, COUNT(student_group.group_id) as number_of_students FROM `groups` JOIN student_group ON student_group.group_id = id WHERE 1'
    // let stmt ='SELECT * FROM groups WHERE 1'
    //  + 'LEFT JOIN student_group ON groups.id = student_group.student_id '

    if (filters.name && filters.name != '') stmt += ' And groups.name like \'%' + filters.name + '%\''
    if (filters.id && filters.id != '') stmt += ' AND groups.id=\'' + filters.id + '\''
    if (filters.status && filters.status != '') stmt += ' AND groups.status =\'' + filters.status + '\''
    if (filters.level && filters.level != '') stmt += ' AND level =\'' + filters.level + '\''
    if (filters.timing && filters.timing != '') stmt += ' AND time =\'' + filters.timing + '\''

    if (filters.teacher && filters.teacher != '') stmt += ' And groups.teacher1 like \'%' + filters.teacher + '%\'' + ' OR groups.teacher2 like \'%' + filters.teacher + '%\''

    if (filters.startDateFrom && filters.startDateFrom != '') stmt += ' AND groups.starting_date >= \'' + filters.startDateFrom + '\''
    if (filters.startDateTo && filters.startDateTo != '') stmt += ' AND groups.starting_date <= \'' + filters.startDateTo + '\''

    if (filters.finishDateFrom && filters.finishDateFrom != '') stmt += ' AND groups.finishing_date >= \'' + filters.finishDateFrom + '\''
    if (filters.finishDateTo && filters.finishDateTo != '') stmt += ' AND groups.finishing_date <= \'' + filters.finishDateTo + '\''
    //TODO: complete all filters

    stmt += '  GROUP BY groups.id'

    console.log('stmt = ' + stmt)
    connection.query(stmt, (err, results, fields) => {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'groups did not fetch successfully',
          err,
        });
      }

      results = results.map((group) => {
        return {
          id: group.id,
          name: group.name,
          level: group.level,
          status: group.status,
          teacher1: group.teacher1,
          teacher2: group.teacher2,
          startDate: group.starting_date,
          endDate: group.finishing_date,
          time: group.time,
          commitLessons: group.commited_lessons,
          accumulatedLessons:0,
          remarks: group.remarks,
          numberOfStudents: group.number_of_students,
        }
      })

      console.log(results)
      return res.status(200).send({
        success: 'true',
        message: 'group fetched successfully',
        results,
      })
    })
  })


  
  // fetch active and potential groups filters  //modified to fetch all groups 
  router.get('/active_potential/fetch/', function (req, res, next) {

    
    // let query = 'SELECT * FROM groups WHERE status=\'active\' OR status=\'potential\''
    let query = 'SELECT groups.*, COUNT(student_group.group_id) as number_of_students FROM `groups` JOIN student_group ON student_group.group_id = id WHERE 1 GROUP BY groups.id'


    connection.query(query, function (err, results) {
      if (err) {
        return res.status(404).send({
          success: 'false',
          message: 'group does not exist',
        });
      }

      results = results.map((group) => {
        return {
          id: group.id,
          name: group.name,
          level: group.level,
          status: group.status,
          teacher1: group.teacher1,
          teacher2: group.teacher2,
          startDate: group.starting_date,
          endDate: group.finishing_date,
          time: group.time,
          commitLessons: group.commited_lessons,
          accumulatedLessons:0,
          remarks: group.remarks,
          numberOfStudents: group.number_of_students
        }
      })

      return res.status(200).send({
        success: 'true',
        message: 'group retrieved successfully',
        results,
      })

    })
  })



})


router.post('/api/v1/update', function (req, res, next) {

  const mapValues = {
    id: 'id',
    name: 'name',
    level: 'level',
    status: 'status',
    teacher1: 'teacher1',
    teacher2: 'teacher2',
    startDate: 'starting_date',
    endDate: 'finishing_date',
    time: 'time',
    commitLessons: 'commited_lessons',
    accumulatedLessons:0,
    remarks: 'remarks',
  }                           


  const data = req.body.data

  console.log(data)
  let stmt = 'UPDATE groups SET '+ mapValues[data.type] +' = ?  WHERE id = ?'
  let values = [
    data.value,
    data.groupId,
  ];

  console.log(stmt)
  

  connection.query(stmt, values, (err, results, fields) => {
    if (err) {
      return res.status(404).send({
        success: 'false',
        message: 'group did not updated successfully',
        err,
      });
    }
    return res.status(200).send({
      success: 'true',
      message: 'group updated successfully',
      data,
    })
  });
})



module.exports = router;
